import type { ExecutionContext } from "../types";
import { execute } from "../utils/exec";
import { getRunCommand } from "../utils/package-manager";
import { BaseProcessor } from "./types";

/**
 * Processor for initializing the project (generate types, routes, etc.)
 */
export class ProjectInitProcessor extends BaseProcessor {
	name = "project-init";
	order = 110; // Run after dependencies

	shouldRun(context: ExecutionContext): boolean {
		return (
			!context.config.skipInit &&
			context.getState<boolean>("dependenciesInstalled") === true
		);
	}

	async process(context: ExecutionContext): Promise<void> {
		const message = context.hasFeature("database")
			? "Initializing project (types, routes, database)..."
			: "Initializing project (types, routes)...";

		context.logger.info(message);

		try {
			const commands = this.getInitCommands(context);

			for (const cmd of commands) {
				await execute(cmd, { cwd: context.projectPath, silent: true });
			}

			context.logger.success("Project initialized!");
		} catch (error: any) {
			context.logger.error(`Failed to initialize project: ${error.message}`);
			context.logger.warn(
				"You can run the initialization commands manually later.",
			);
		}
	}

	private getInitCommands(context: ExecutionContext): string[] {
		const { packageManager, type } = context.config;
		const commands = [getRunCommand(packageManager, "gen:types")];

		if (type === "full-stack") {
			commands.push(getRunCommand(packageManager, "gen:routes"));
		}

		if (context.hasFeature("database")) {
			commands.push(getRunCommand(packageManager, "db:generate"));
			commands.push(getRunCommand(packageManager, "db:push:local"));
		}

		commands.push(getRunCommand(packageManager, "gen:api"));

		return commands;
	}
}