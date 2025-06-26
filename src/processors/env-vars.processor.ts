import path from "node:path";
import type { ExecutionContext } from "../types";
import { pathExists, writeFile } from "../utils/fs";
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
		if (!(await pathExists(devVarsPath))) {
			await writeFile(devVarsPath, content);
		}

		// Always update .dev.vars.example
		await writeFile(devVarsExamplePath, content);

		context.logger.debug("Environment variable files created");
	}
}
