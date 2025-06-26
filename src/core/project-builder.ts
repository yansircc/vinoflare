import path from "node:path";
import type { ProcessorRegistry } from "../processors/registry";
import type { TemplateLoader } from "../templates/template-loader";
import { type ProjectConfig, Template } from "../types";
import { pathExists } from "../utils/fs";
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
		const projectPath = path.join(process.cwd(), config.name);
		if (await pathExists(projectPath)) {
			throw new Error(`Directory ${config.name} already exists`);
		}

		// Load template
		const template = await this.templateLoader.loadTemplate(config.type);

		// Create execution context
		const context = new ProjectContext(
			projectPath,
			config,
			template,
			this.logger,
		);

		// Execute processors in order
		const processors = this.processorRegistry.getOrderedProcessors();
		const executedProcessors: string[] = [];

		try {
			for (const processor of processors) {
				if (processor.shouldRun(context)) {
					this.logger.info(`Running ${processor.name}...`);
					await processor.process(context);
					executedProcessors.push(processor.name);
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
