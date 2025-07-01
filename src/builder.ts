import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import * as p from "@clack/prompts";
import fs from "fs-extra";
import kleur from "kleur";
import { getBranchForConfig } from "./branch-mapper";
import { cloneTemplateBranch, initializeGit } from "./git-clone";
import type { ProjectConfig } from "./types";

const execAsync = promisify(exec);

async function promptForSetup(
	config: ProjectConfig,
	workDir: string,
): Promise<boolean> {
	// Skip setup prompt in non-interactive mode
	if (config.yes) {
		return false;
	}

	const setupNeeded = config.db || config.auth || config.type === "full-stack";
	if (!setupNeeded) {
		return false;
	}

	console.log();
	const runSetup = await p.confirm({
		message: "Would you like to run the initial setup? (recommended)",
		initialValue: true,
	});

	if (p.isCancel(runSetup) || !runSetup) {
		return false;
	}

	const spinner = p.spinner();

	try {
		// Install dependencies first if not already installed
		if (!config.install) {
			spinner.start("Installing dependencies...");
			const installCmd = {
				npm: "npm install",
				yarn: "yarn install",
				pnpm: "pnpm install",
				bun: "bun install",
			}[config.packageManager];
			await execAsync(installCmd, { cwd: workDir });
			spinner.stop("Dependencies installed");
		}

		// Database setup
		if (config.db) {
			spinner.start("Setting up database...");
			await execAsync(`${config.packageManager} run db:generate`, { cwd: workDir });
			await execAsync(`${config.packageManager} run db:push:local`, { cwd: workDir });
			await execAsync(`${config.packageManager} run gen:types`, { cwd: workDir });
			spinner.stop("Database setup complete");
		}

		// Auth setup
		if (config.auth) {
			spinner.start("Setting up authentication...");
			
			// Create .dev.vars from example
			const examplePath = path.join(workDir, ".dev.vars.example");
			const devVarsPath = path.join(workDir, ".dev.vars");
			
			if (await fs.pathExists(examplePath)) {
				await fs.copy(examplePath, devVarsPath);
			} else {
				// Create a basic .dev.vars file
				const devVarsContent = `# Development environment variables
BETTER_AUTH_SECRET=development-secret-key-change-in-production

# Discord OAuth (get from https://discord.com/developers/applications)
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
`;
				await fs.writeFile(devVarsPath, devVarsContent);
			}
			
			spinner.stop("Authentication setup complete");
			
			console.log();
			console.log(kleur.yellow("⚠️  Remember to update .dev.vars with your Discord OAuth credentials"));
		}

		// Frontend setup
		if (config.type === "full-stack") {
			spinner.start("Setting up frontend...");
			
			// Ensure generated directory exists
			const generatedDir = path.join(workDir, "src", "generated");
			await fs.ensureDir(generatedDir);
			
			await execAsync(`${config.packageManager} run gen:routes`, { cwd: workDir });
			
			// Only run gen:api if there's a backend API
			if (config.db || !config.db) { // Always true for now, but keeping for clarity
				await execAsync(`${config.packageManager} run gen:api`, { cwd: workDir });
			}
			
			spinner.stop("Frontend setup complete");
		}

		return true;
	} catch (error) {
		spinner.stop("Setup failed");
		console.error(kleur.red(`\nSetup failed: ${error}`));
		console.log(kleur.yellow("\nYou can run the setup commands manually later."));
		return false;
	}
}

export async function buildProject(config: ProjectConfig): Promise<void> {
	const spinner = p.spinner();
	const projectPath = path.join(process.cwd(), config.name);

	try {
		// Check if directory exists
		if (config.name !== "." && (await fs.pathExists(projectPath))) {
			throw new Error(`Directory ${config.name} already exists`);
		}

		// Get the appropriate branch
		const branch = getBranchForConfig(config);

		spinner.start("Setting up project template...");

		if (config.name === ".") {
			// Copy to a temp directory first, then move contents
			const tempDir = path.join(process.cwd(), ".vinoflare-temp");
			await cloneTemplateBranch(branch, tempDir);

			// Move all contents to current directory
			const files = await fs.readdir(tempDir);
			for (const file of files) {
				await fs.move(
					path.join(tempDir, file),
					path.join(process.cwd(), file),
					{ overwrite: true },
				);
			}
			await fs.remove(tempDir);
		} else {
			await cloneTemplateBranch(branch, projectPath);
		}

		spinner.stop("Template ready");

		// Update package.json with project name
		spinner.start("Updating package.json...");
		const packageJsonPath = path.join(
			config.name === "." ? process.cwd() : projectPath,
			"package.json",
		);
		const packageJson = await fs.readJson(packageJsonPath);
		packageJson.name =
			config.name === "." ? path.basename(process.cwd()) : config.name;
		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
		spinner.stop("Package.json updated");

		// Initialize git if requested
		if (config.git) {
			spinner.start("Initializing git repository...");
			await initializeGit(config.name === "." ? process.cwd() : projectPath);
			spinner.stop("Git repository initialized");
		}

		// Install dependencies if requested
		if (config.install) {
			spinner.start(`Installing dependencies with ${config.packageManager}...`);
			const cwd = config.name === "." ? process.cwd() : projectPath;

			const installCmd = {
				npm: "npm install",
				yarn: "yarn install",
				pnpm: "pnpm install",
				bun: "bun install",
			}[config.packageManager];

			await execAsync(installCmd, { cwd });
			spinner.stop("Dependencies installed");
		}

		// Success!
		p.outro(kleur.green("✓ Project created successfully!"));

		// Ask about setup
		const workDir = config.name === "." ? process.cwd() : projectPath;
		const shouldSetup = await promptForSetup(config, workDir);

		// Show next steps
		console.log();
		console.log(kleur.bold("Next steps:"));

		if (config.name !== ".") {
			console.log(kleur.dim(`  cd ${config.name}`));
		}

		if (!config.install) {
			console.log(kleur.dim(`  ${config.packageManager} install`));
		}

		if (!shouldSetup) {
			// Show manual setup instructions if skipped
			if (config.db) {
				console.log();
				console.log(kleur.yellow("⚠️  Database Setup Required:"));
				console.log(kleur.dim(`  ${config.packageManager} run db:generate`));
				console.log(kleur.dim(`  ${config.packageManager} run db:push:local`));
				console.log(kleur.dim(`  ${config.packageManager} run gen:types`));
			}

			if (config.auth) {
				console.log();
				console.log(kleur.yellow("⚠️  Authentication Setup Required:"));
				console.log(kleur.dim("  1. Copy .dev.vars.example to .dev.vars"));
				console.log(kleur.dim("  2. Add your Discord OAuth credentials"));
			}

			if (config.type === "full-stack") {
				console.log();
				console.log(kleur.yellow("⚠️  Frontend Setup Required:"));
				console.log(kleur.dim(`  ${config.packageManager} run gen:routes`));
				console.log(kleur.dim(`  ${config.packageManager} run gen:api`));
			}
		}

		console.log();
		console.log(kleur.dim(`  ${config.packageManager} run dev`));
		console.log();
		console.log(kleur.dim("Happy coding! 🚀"));
	} catch (error) {
		spinner.stop("Failed to create project");
		throw error;
	}
}
