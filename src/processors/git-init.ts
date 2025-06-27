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

			// Format and fix code before committing
			if (context.getState<boolean>("dependenciesInstalled")) {
				context.logger.info("Running lint:fix to format code...");
				await execute(
					getRunCommand(context.config.packageManager, "lint:fix"),
					{ cwd: context.projectPath, silent: true },
				);
				context.logger.success("Code formatted successfully");
			}

			// Create initial commit
			await execute("git add -A", { cwd: context.projectPath });
			// Use --quiet to reduce output and prevent buffer overflow
			await execute('git commit -m "chore: initial commit" --quiet', {
				cwd: context.projectPath,
				silent: true,
			});

			context.logger.success("Git repository initialized with initial commit!");
		} catch (error: any) {
			context.logger.error(`Failed to initialize git: ${error.message}`);
			// Git init failure is not critical
		}
	}
}
