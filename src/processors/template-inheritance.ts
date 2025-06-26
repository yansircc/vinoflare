import path from "node:path";
import type { ExecutionContext, Processor } from "../types";
import { createFileOperations } from "../utils/file-operations";
import { getLogger } from "../utils/logger";

/**
 * Processor that handles template inheritance - copies files from shared templates
 */
export class TemplateInheritanceProcessor implements Processor {
	name = "template-inheritance";
	order = 5; // Run before copy-template
	private logger = getLogger();

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		const templateConfig = context.getState<any>("templateConfig");
		
		// Check if template extends another template
		if (!templateConfig?.extends) {
			return;
		}

		context.logger.info(`Inheriting from template: ${templateConfig.extends}`);

		const baseTemplatePaths = Array.isArray(templateConfig.extends) 
			? templateConfig.extends 
			: [templateConfig.extends];

		for (const baseTemplate of baseTemplatePaths) {
			await this.copyBaseTemplate(context, baseTemplate);
		}

		context.logger.success("Template inheritance completed");
	}

	private async copyBaseTemplate(
		context: ExecutionContext,
		baseTemplate: string
	): Promise<void> {
		const fileOps = createFileOperations(context.projectPath);
		const baseTemplatePath = path.join(
			path.dirname(context.getState<string>("templatePath") || ""),
			"..",
			baseTemplate
		);

		context.logger.debug(`Copying from base template: ${baseTemplatePath}`);

		// Copy all files from base template
		const srcPath = path.join(baseTemplatePath, "src");
		if (await fileOps.exists(path.relative(context.projectPath, srcPath))) {
			await fileOps.copy(
				path.relative(context.projectPath, srcPath),
				"src"
			);
		}

		// Copy other root files (configs, scripts, etc.)
		const rootFiles = [
			"drizzle.config.ts",
			"biome.jsonc",
			"tsconfig.json",
			"vitest.config.ts",
			"scripts"
		];

		for (const file of rootFiles) {
			const sourcePath = path.join(baseTemplatePath, file);
			if (await fileOps.exists(path.relative(context.projectPath, sourcePath))) {
				await fileOps.copy(
					path.relative(context.projectPath, sourcePath),
					file
				);
			}
		}
	}
}