import path from "node:path";
import fs, { pathExists } from "fs-extra";
import type { ProcessorRegistry } from "../processors/registry";
import type { TemplateLoader } from "../templates/template-loader";
import type { ProjectConfig } from "../types";
import { createLogger } from "../utils/logger";
import { ProjectContext } from "./context";

/**
 * Main project builder that orchestrates the creation process
 */
export class ProjectBuilder {
	private logger = createLogger();

	constructor(
		private templateLoader: TemplateLoader,
		private processorRegistry: ProcessorRegistry,
	) {}

	/**
	 * Build a project based on configuration
	 */
	async build(config: ProjectConfig): Promise<void> {
		// Validate project path
		const projectPath = config.name === "." ? process.cwd() : path.join(process.cwd(), config.name);
		if (config.name !== "." && await pathExists(projectPath)) {
			throw new Error(`Directory ${config.name} already exists`);
		}

		// Load template
		const template = await this.templateLoader.loadTemplate(config.type);
		const unifiedConfig = await this.templateLoader.loadUnifiedTemplate(
			config.type,
		);

		// Create execution context
		const context = new ProjectContext(
			projectPath,
			config,
			template,
			this.logger,
		);

		// Add unified config to context
		context.setState("unifiedConfig", unifiedConfig);
		context.setState("templatePath", template.path);

		// Execute processors in order
		const processors = this.processorRegistry.getOrderedProcessors();
		const executedProcessors: string[] = [];

		// Debug log
		await fs.appendFile(
			"project-builder-debug.log",
			`\n[${new Date().toISOString()}] Starting build for project: ${config.name}\n`,
		);
		await fs.appendFile(
			"project-builder-debug.log",
			`Processors: ${processors.map((p) => p.name).join(", ")}\n`,
		);

		try {
			for (const processor of processors) {
				if (processor.shouldRun(context)) {
					await fs.appendFile(
						"project-builder-debug.log",
						`Running processor: ${processor.name}\n`,
					);
					console.log(`[PROJECT-BUILDER] Running processor: ${processor.name}`);
					this.logger.info(`Running ${processor.name}...`);
					await processor.process(context);
					executedProcessors.push(processor.name);
				} else {
					await fs.appendFile(
						"project-builder-debug.log",
						`Skipping processor: ${processor.name}\n`,
					);
					console.log(
						`[PROJECT-BUILDER] Skipping processor: ${processor.name}`,
					);
				}
			}
		} catch (error) {
			// Rollback on error
			this.logger.error(`Error during project creation: ${error}`);
			await this.rollback(context, executedProcessors);
			throw error;
		}
	}

	/**
	 * Rollback executed processors in reverse order
	 */
	private async rollback(
		context: ProjectContext,
		executedProcessors: string[],
	): Promise<void> {
		this.logger.warn("Rolling back changes...");

		for (const processorName of executedProcessors.reverse()) {
			const processor = this.processorRegistry.get(processorName);
			if (processor?.rollback) {
				try {
					await processor.rollback(context);
				} catch (error) {
					this.logger.error(`Failed to rollback ${processorName}: ${error}`);
				}
			}
		}
	}
}
