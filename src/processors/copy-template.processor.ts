import type { ExecutionContext } from "../types";
import { createFileOperations } from "../utils/file-operations";
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

		const fs = await import("fs-extra");
		await fs.copy(context.template.path, context.projectPath);

		context.logger.success("Template files copied successfully");
	}
}
