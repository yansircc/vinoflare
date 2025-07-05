import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import type { CLIOptions } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
	readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
);

export function createCLI(): Command {
	const program = new Command();

	program
		.name("create-vinoflare")
		.description("Create modern full-stack apps with Vinoflare")
		.version(packageJson.version)
		.argument("[name]", "Project name")
		.option("-t, --type <type>", "Project type (full-stack or api-only)")
		.option("--no-auth", "Exclude authentication")
		.option("--no-db", "Exclude database")
		.option("-y, --yes", "Skip prompts and use defaults")
		.option("--no-install", "Skip dependency installation")
		.option("--no-git", "Skip git initialization")
		.option("--pm, --package-manager <pm>", "Package manager to use")
		.option("--rpc", "Use Hono RPC client instead of Orval (full-stack only)")
		.action((name: string, options: any) => {
			// Convert commander options to our CLIOptions type
			// Only set values if they were explicitly provided
			const cliOptions: CLIOptions = {
				name,
				type: options.type,
				// For --no-* options, only set if explicitly used
				auth: program.opts().auth === false ? false : undefined,
				db: program.opts().db === false ? false : undefined,
				yes: options.yes,
				install: program.opts().install === false ? false : undefined,
				git: program.opts().git === false ? false : undefined,
				packageManager: options.packageManager,
				rpc: options.rpc,
			};

			// Store the options for use in the main function
			(program as any).cliOptions = cliOptions;
		});

	return program;
}

export function getCLIOptions(program: Command): CLIOptions {
	return (program as any).cliOptions;
}
