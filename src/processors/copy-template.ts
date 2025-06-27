import type { ExecutionContext } from "../types";
import { BaseProcessor } from "./types";

/**
 * Processor for copying template files to project directory
 */
export class CopyTemplateProcessor extends BaseProcessor {
	name = "copy-template";
	order = 10; // Run early

	shouldRun(): boolean {
		// Always run
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.info("Copying template files...");

		const fsExtra = await import("fs-extra");
		const path = await import("path");
		
		await fsExtra.copy(context.template.path, context.projectPath);
		
		// Rename gitignore to .gitignore if it exists
		const gitignorePath = path.join(context.projectPath, "gitignore");
		const dotGitignorePath = path.join(context.projectPath, ".gitignore");
		
		if (await fsExtra.pathExists(gitignorePath)) {
			await fsExtra.move(gitignorePath, dotGitignorePath);
		}

		context.logger.success("Template files copied successfully");
	}
}
