import type { ExecutionContext } from "../types";
import { execute } from "../utils/exec";
import { getRunCommand } from "../utils/package-manager";
import { BaseProcessor } from "./types";

/**
 * Processor for initializing git repository
 */
export class GitInitProcessor extends BaseProcessor {
	name = "git-init";
	order = 120; // Run after dependencies

	shouldRun(context: ExecutionContext): boolean {
		return context.config.git;
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.info("Initializing git repository...");

		try {
			// Initialize git
			await execute("git init", { cwd: context.projectPath });

			// Format code if dependencies were installed
			if (context.getState<boolean>("dependenciesInstalled")) {
				await execute(
					getRunCommand(context.config.packageManager, "lint:fix"),
					{ cwd: context.projectPath, silent: true },
				);
			}

			// Create initial commit
			await execute("git add -A", { cwd: context.projectPath });
			await execute('git commit -m "chore: initial commit"', {
				cwd: context.projectPath,
			});

			context.logger.success("Git repository initialized!");
		} catch (error: any) {
			context.logger.error(`Failed to initialize git: ${error.message}`);
			// Git init failure is not critical
		}
	}
}
