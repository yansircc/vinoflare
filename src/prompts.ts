import * as p from "@clack/prompts";
import kleur from "kleur";
import type { CLIOptions, PackageManager, ProjectConfig } from "./types";

export async function promptForMissingOptions(
	options: CLIOptions,
): Promise<ProjectConfig | null> {
	console.log();
	p.intro(kleur.bgMagenta(kleur.black(" create-vinoflare ")));

	const config: Partial<ProjectConfig> = {
		name: options.name,
	};

	// Project type
	if (options.type) {
		config.type = options.type;
	} else {
		const type = await p.select({
			message: "What type of project would you like to create?",
			options: [
				{
					value: "full-stack",
					label: "Full-stack (Frontend + Backend)",
					hint: "React + TanStack Router + Hono API",
				},
				{
					value: "api-only",
					label: "API only",
					hint: "Hono API server for Cloudflare Workers",
				},
			],
		});

		if (p.isCancel(type)) {
			p.cancel("Operation cancelled");
			return null;
		}

		config.type = type as "full-stack" | "api-only";
	}

	// Database
	if (options.db !== undefined) {
		config.db = options.db;
	} else {
		const db = await p.confirm({
			message: "Would you like to include a database (D1)?",
			initialValue: true,
		});

		if (p.isCancel(db)) {
			p.cancel("Operation cancelled");
			return null;
		}

		config.db = db;
	}

	// Auth (only if database is enabled)
	if (config.db) {
		if (options.auth !== undefined) {
			config.auth = options.auth;
		} else {
			const auth = await p.confirm({
				message: "Would you like to include authentication (Better Auth)?",
				initialValue: true,
			});

			if (p.isCancel(auth)) {
				p.cancel("Operation cancelled");
				return null;
			}

			config.auth = auth;
		}
	} else {
		config.auth = false;
	}

	// Git initialization
	if (options.git !== undefined) {
		config.git = options.git;
	} else {
		const git = await p.confirm({
			message: "Initialize a git repository?",
			initialValue: true,
		});

		if (p.isCancel(git)) {
			p.cancel("Operation cancelled");
			return null;
		}

		config.git = git;
	}

	// Dependency installation
	if (options.install !== undefined) {
		config.install = options.install;
	} else {
		const install = await p.confirm({
			message: "Install dependencies?",
			initialValue: true,
		});

		if (p.isCancel(install)) {
			p.cancel("Operation cancelled");
			return null;
		}

		config.install = install;
	}

	// Package manager - use provided option or detect
	if (options.packageManager) {
		config.packageManager = options.packageManager as PackageManager;
	} else {
		const pm = detectPackageManager();
		config.packageManager = pm;
	}

	// Initial setup (only if db, auth, or full-stack)
	const setupNeeded = config.db || config.auth || config.type === "full-stack";
	if (setupNeeded) {
		if (options.setup !== undefined) {
			config.setup = options.setup;
		} else {
			const setup = await p.confirm({
				message: "Run initial setup after creation? (recommended)",
				initialValue: true,
			});

			if (p.isCancel(setup)) {
				p.cancel("Operation cancelled");
				return null;
			}

			config.setup = setup;
		}
	} else {
		config.setup = false;
	}

	// Summary
	const summary = `
${kleur.bold("Project Configuration:")}
  ${kleur.dim("Name:")} ${config.name}
  ${kleur.dim("Type:")} ${config.type}
  ${kleur.dim("Database:")} ${config.db ? "Yes (D1)" : "No"}
  ${kleur.dim("Auth:")} ${config.auth ? "Yes (Better Auth)" : "No"}
  ${kleur.dim("Git:")} ${config.git ? "Yes" : "No"}
  ${kleur.dim("Install:")} ${config.install ? "Yes" : "No"}
  ${kleur.dim("Package Manager:")} ${config.packageManager}${
		setupNeeded
			? `
  ${kleur.dim("Initial Setup:")} ${config.setup ? "Yes" : "No"}`
			: ""
	}
`;

	console.log(summary);

	const confirmed = await p.confirm({
		message: "Create project with this configuration?",
		initialValue: true,
	});

	if (p.isCancel(confirmed) || !confirmed) {
		p.cancel("Operation cancelled");
		return null;
	}

	return config as ProjectConfig;
}

function detectPackageManager(): "npm" | "yarn" | "pnpm" | "bun" {
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
