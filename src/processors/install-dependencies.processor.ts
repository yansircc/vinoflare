import type { ExecutionContext } from "../types";
import { execute } from "../utils/exec";
import { getInstallCommand } from "../utils/package-manager";
import { BaseProcessor } from "./types";

/**
 * Processor for installing dependencies
 */
export class InstallDependenciesProcessor extends BaseProcessor {
	name = "install-dependencies";
	order = 100; // Run late

	shouldRun(context: ExecutionContext): boolean {
		return context.config.install;
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.info(
			`Installing dependencies with ${context.config.packageManager}...`,
		);

		try {
			await execute(getInstallCommand(context.config.packageManager), {
				cwd: context.projectPath,
			});

			context.setState("dependenciesInstalled", true);
			context.logger.success("Dependencies installed!");
		} catch (error: any) {
			context.logger.error(`Failed to install dependencies: ${error.message}`);
			throw error;
		}
	}
}
