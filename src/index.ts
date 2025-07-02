#!/usr/bin/env node

import * as p from "@clack/prompts";
import kleur from "kleur";
import { buildProject } from "./builder";
import { createCLI, getCLIOptions } from "./cli";
import { promptForMissingOptions } from "./prompts";
import type { PackageManager, ProjectConfig } from "./types";

function detectPackageManager(): PackageManager {
	try {
		// Check common environment variables
		if (process.env.npm_execpath?.includes("yarn")) return "yarn";
		if (process.env.npm_execpath?.includes("pnpm")) return "pnpm";
		if (process.env.npm_execpath?.includes("bun")) return "bun";

		// Check user agent
		const userAgent = process.env.npm_config_user_agent;
		if (userAgent) {
			if (userAgent.includes("yarn")) return "yarn";
			if (userAgent.includes("pnpm")) return "pnpm";
			if (userAgent.includes("bun")) return "bun";
		}

		return "npm";
	} catch {
		return "npm";
	}
}

async function main() {
	try {
		const program = createCLI();
		program.parse(process.argv);
		const options = getCLIOptions(program);

		let config: ProjectConfig;

		if (options.yes) {
			// Check if project name is provided with --yes flag
			if (!options.name) {
				p.cancel(kleur.red("Project name is required when using --yes flag"));
				console.log(kleur.dim("  Usage: create-vinoflare <project-name> --yes"));
				process.exit(1);
			}

			// Use defaults with --yes flag
			const pm =
				(options.packageManager as PackageManager) || detectPackageManager();

			config = {
				name: options.name,
				type: options.type || "full-stack",
				db: options.db !== false,
				auth: options.auth !== false && options.db !== false,
				git: options.git !== false,
				install: options.install !== false,
				packageManager: pm,
				yes: true,
				setup: false, // Don't run setup automatically with --yes
			};
		} else {
			// Interactive mode
			const result = await promptForMissingOptions(options);
			if (!result) {
				process.exit(0);
			}
			config = result;
		}

		// Build the project
		await buildProject(config);

		process.exit(0);
	} catch (error: any) {
		console.error();
		p.cancel(kleur.red(error.message));
		process.exit(1);
	}
}

main();
