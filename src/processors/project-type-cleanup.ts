import transformRules from "../../config/transform-rules.json";
import type { ExecutionContext, Processor } from "../types";
import type { TransformRulesConfig } from "../types/config";
import { createFileOperations } from "../utils/file-operations";
import { getLogger } from "../utils/logger";

/**
 * Processor to handle project-type specific file cleanup
 */
export class ProjectTypeCleanupProcessor implements Processor {
	name = "project-type-cleanup";
	order = 25; // Run after copy-template but before feature-cleanup
	private logger = getLogger();

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		this.logger.info("Cleaning up project-type specific files...");

		const projectType = context.config.type;
		const rules = transformRules as TransformRulesConfig;
		const projectTypeRules = (rules as any).projectTypes?.[projectType];

		if (!projectTypeRules?.files?.remove) {
			this.logger.debug(`No files to remove for project type: ${projectType}`);
			return;
		}

		const fileOps = createFileOperations(context.projectPath);
		const filesToRemove = projectTypeRules.files.remove;

		if (filesToRemove.length > 0) {
			this.logger.info(
				`Removing ${filesToRemove.length} files for ${projectType} project`,
			);
			await fileOps.removeFiles(filesToRemove);
		}

		// Handle conditional removals
		if (
			projectTypeRules.files.removeWhenNoAuth &&
			!context.hasFeature("auth")
		) {
			this.logger.info("Removing auth-specific files for project without auth");
			await fileOps.removeFiles(projectTypeRules.files.removeWhenNoAuth);
		}

		this.logger.success("Project-type cleanup completed");
	}
}
