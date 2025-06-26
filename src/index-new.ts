#!/usr/bin/env node

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

import { CopyTemplateProcessor } from "./processors/copy-template.processor";
import { FeatureCleanupProcessor } from "./processors/feature-cleanup.processor";
import { PackageJsonProcessor } from "./processors/package-json.processor";
// Processors
import { ProcessorRegistry } from "./processors/registry";

import type { ProjectConfig } from "./types";
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

	// Build project configuration
	const config: ProjectConfig = {
		name: projectName,
		type: projectType,
		features: {
			database: includeDb,
			auth: includeAuth,
		},
		packageManager,
		git: parsedArgs.flags.noGit ? false : true,
		install: parsedArgs.flags.noInstall ? false : true,
		skipInit: parsedArgs.flags.skipInit,
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

		// Register processors
		processorRegistry.registerAll([
			new CopyTemplateProcessor(),
			new PackageJsonProcessor(),
			new FeatureCleanupProcessor(),
			// Add more processors here as they are implemented
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
${kleur.green("✓")} Project created at ${kleur.cyan(`./${config.name}`)}${featuresText}

Next steps:
  ${kleur.cyan(`cd ${config.name}`)}
  ${kleur.cyan(`${config.packageManager} run dev`)}

${kleur.dim("For more commands, check the README.md file.")}
`);
	} catch (error: any) {
		s.stop("Failed to create project");
		console.error(kleur.red("Error:"), error.message);
		process.exit(1);
	}
}

// Run main function
main().catch((error) => {
	console.error("An unexpected error occurred:", error);
	process.exit(1);
});
