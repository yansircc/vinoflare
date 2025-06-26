#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { cancel, intro, outro, spinner } from "@clack/prompts";
import kleur from "kleur";

import { showHelp } from "./cli/help";
// CLI components
import { parseArgs, validateArgs } from "./cli/parser";
import { InteractivePrompts } from "./cli/prompts";

// Core components
import { ProjectBuilder } from "./core/project-builder";
import { TemplateLoader } from "./templates/template-loader";

import { ClientNoDbProcessor } from "./processors/client-no-db.processor";
import { CopyTemplateProcessor } from "./processors/copy-template.processor";
import { EnvVarsProcessor } from "./processors/env-vars.processor";
import { FeatureCleanupProcessor } from "./processors/feature-cleanup.processor";
import { FileTransformProcessor } from "./processors/file-transform.processor";
import { GitInitProcessor } from "./processors/git-init.processor";
import { InstallDependenciesProcessor } from "./processors/install-dependencies.processor";
import { PackageJsonProcessor } from "./processors/package-json.processor";
import { ProjectInitProcessor } from "./processors/project-init.processor";
import { TemplateInheritanceProcessor } from "./processors/template-inheritance.processor";
// Processors
import { ProcessorRegistry } from "./processors/registry";

import type { ProjectConfig } from "./types";
import { pathExists } from "./utils/fs";
// Utils
import {
	detectPackageManager,
	isValidPackageManager,
} from "./utils/package-manager";

async function main() {
	console.log();
	intro(kleur.bgCyan().black(" create-vino-app "));

	// Parse arguments
	const parsedArgs = parseArgs();

	// Show help if requested
	if (parsedArgs.flags.help) {
		showHelp();
		process.exit(0);
	}

	// Validate arguments
	const errors = validateArgs(parsedArgs);
	if (errors.length > 0) {
		errors.forEach((err) => console.error(kleur.red(`✖ ${err}`)));
		process.exit(1);
	}

	// Detect or validate package manager
	const packageManager = parsedArgs.flags.packageManager
		? isValidPackageManager(parsedArgs.flags.packageManager)
			? parsedArgs.flags.packageManager
			: null
		: detectPackageManager();

	if (!packageManager) {
		cancel(`Invalid package manager: ${parsedArgs.flags.packageManager}`);
		process.exit(1);
	}

	// Interactive prompts
	const prompts = new InteractivePrompts(parsedArgs.flags);

	// Get project configuration
	const projectName = await prompts.getProjectName(parsedArgs.projectName);
	if (typeof projectName === "symbol") {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// Check if directory exists
	const targetDir = path.join(process.cwd(), projectName);
	if (await pathExists(targetDir)) {
		cancel(`Directory ${projectName} already exists`);
		process.exit(1);
	}

	const projectType = await prompts.getProjectType();
	if (typeof projectType === "symbol") {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const includeDb = await prompts.getDatabaseOption();
	if (typeof includeDb === "symbol") {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const includeAuth = await prompts.getAuthOption(includeDb);
	if (typeof includeAuth === "symbol") {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// Warn if auth requested without database
	if (!includeDb && parsedArgs.flags.noAuth === false) {
		console.log(
			kleur.yellow("⚠️  Better Auth requires a database. Skipping auth."),
		);
	}

	const shouldInstall = await prompts.getInstallOption();
	if (typeof shouldInstall === "symbol") {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const shouldInitGit = await prompts.getGitOption();
	if (typeof shouldInitGit === "symbol") {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const shouldInit = shouldInstall
		? await prompts.getInitOption(includeDb)
		: false;
	if (typeof shouldInit === "symbol") {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// Build project configuration
	const config: ProjectConfig = {
		name: projectName,
		type: projectType,
		features: {
			database: includeDb,
			auth: includeAuth,
		},
		packageManager,
		git: shouldInitGit,
		install: shouldInstall,
		skipInit: !shouldInit,
	};

	// Show configuration summary in non-interactive mode
	if (parsedArgs.flags.yes) {
		console.log();
		console.log(kleur.dim("Configuration:"));
		console.log(kleur.dim(`  Project: ${config.name}`));
		console.log(kleur.dim(`  Type: ${config.type}`));
		console.log(
			kleur.dim(`  Database: ${config.features.database ? "Yes" : "No"}`),
		);
		console.log(kleur.dim(`  Auth: ${config.features.auth ? "Yes" : "No"}`));
		console.log(kleur.dim(`  Package Manager: ${config.packageManager}`));
		console.log();
	}

	// Create project
	const s = spinner();
	s.start("Creating project...");

	try {
		// Initialize components
		const templateLoader = new TemplateLoader();
		const processorRegistry = new ProcessorRegistry();

		// Register processors in order
		processorRegistry.registerAll([
			new TemplateInheritanceProcessor(),
			new CopyTemplateProcessor(),
			new PackageJsonProcessor(),
			new FeatureCleanupProcessor(),
			new ClientNoDbProcessor(),
			new FileTransformProcessor(),
			new EnvVarsProcessor(),
			new InstallDependenciesProcessor(),
			new ProjectInitProcessor(),
			new GitInitProcessor(),
		]);

		// Build project
		const builder = new ProjectBuilder(templateLoader, processorRegistry);
		await builder.build(config);

		s.stop("Project created successfully!");

		// Success message
		const features = [];
		if (config.features.database) features.push("D1 Database");
		if (config.features.auth) features.push("Better Auth");
		const featuresText =
			features.length > 0
				? `\n${kleur.dim(`Features: ${features.join(", ")}`)}`
				: "";

		outro(`
${kleur.green("✓")} Project created at ${kleur.cyan(targetDir)}${featuresText}

Next steps:
  ${kleur.cyan(`cd ${config.name}`)}
  ${kleur.cyan(`${config.packageManager} run dev`)}

${kleur.dim("For more commands, check the README.md file.")}
`);
	} catch (error: any) {
		s.stop("Failed to create project");
		console.error(kleur.red("Error:"), error.message);
		if (process.env.DEBUG) {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

// Export main for programmatic use
export { main };

// Run main function if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("An unexpected error occurred:", error);
		process.exit(1);
	});
}
