import path from "node:path";
import type { ExecutionContext } from "../types";
import { pathExists } from "../utils/fs";
import { createFileOperations } from "../utils/file-operations";
import { BaseProcessor } from "./types";

/**
 * Processor for creating environment variable files
 */
export class EnvVarsProcessor extends BaseProcessor {
	name = "env-vars";
	order = 50; // Run after file transformations

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.debug("Creating environment variable files...");

		const devVarsPath = path.join(context.projectPath, ".dev.vars");
		const devVarsExamplePath = path.join(
			context.projectPath,
			".dev.vars.example",
		);

		let content = "# Environment variables for local development\n";
		content += "ENVIRONMENT=development\n";

		if (context.hasFeature("auth")) {
			content += "\n# Better Auth Configuration\n";
			content += "BETTER_AUTH_SECRET=your-secret-key-here\n";
			content += "\n# OAuth Providers\n";
			content += "DISCORD_CLIENT_ID=your-discord-client-id\n";
			content += "DISCORD_CLIENT_SECRET=your-discord-client-secret\n";
		}

		// Only create .dev.vars if it doesn't exist
		const fileOps = createFileOperations(context.projectPath);
		if (!(await pathExists(devVarsPath))) {
			await fileOps.write(".dev.vars", content);
		}

		// Always update .dev.vars.example
		await fileOps.write(".dev.vars.example", content);

		context.logger.debug("Environment variable files created");
	}
}