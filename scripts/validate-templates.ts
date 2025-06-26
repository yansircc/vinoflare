#!/usr/bin/env bun

import path from "node:path";
import { fileURLToPath } from "node:url";
import kleur from "kleur";
import transformRules from "../config/transform-rules.json";
import type { TemplateConfig } from "../src/types/template-config";
import type { TransformRulesConfig } from "../src/types/config";
import { ConfigValidator } from "../src/utils/config-validator";
import { pathExists, readJSON } from "../src/utils/fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "../templates");

async function validateAllTemplates() {
	console.log(kleur.bold("\n🔍 Validating all templates and configurations\n"));

	const validator = new ConfigValidator();
	let hasErrors = false;

	// Validate transform rules
	console.log(kleur.blue("Validating transform-rules.json..."));
	const transformRulesResult = validator.validateTransformRules(
		transformRules as TransformRulesConfig
	);
	validator.logValidationResult(transformRulesResult, "transform-rules.json");
	if (!transformRulesResult.valid) hasErrors = true;

	// Get all template directories
	const fs = await import("node:fs/promises");
	const entries = await fs.readdir(templatesDir, { withFileTypes: true });
	const templateDirs = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);

	// Validate each template
	for (const templateName of templateDirs) {
		console.log(`\n${kleur.blue(`Validating template: ${templateName}...`)}`);

		const templatePath = path.join(templatesDir, templateName);
		const configPath = path.join(templatePath, "template.json");

		// Check if template.json exists
		if (!(await pathExists(configPath))) {
			console.log(kleur.yellow(`  ⚠️  No template.json found`));
			continue;
		}

		try {
			// Load and validate template config
			const config = await readJSON(configPath) as TemplateConfig;
			const configResult = validator.validateTemplateConfig(config);
			validator.logValidationResult(configResult, `${templateName}/template.json`);
			if (!configResult.valid) hasErrors = true;

			// Validate template files
			const filesResult = await validator.validateTemplateFiles(templatePath, config);
			if (filesResult.errors.length > 0 || filesResult.warnings.length > 0) {
				validator.logValidationResult(filesResult, `${templateName} files`);
			}
			if (!filesResult.valid) hasErrors = true;

			// Check for required files
			const requiredFiles = [
				"package.json",
				"tsconfig.json",
			];

			for (const file of requiredFiles) {
				const filePath = path.join(templatePath, file);
				if (!(await pathExists(filePath))) {
					console.log(kleur.red(`  ✗ Missing required file: ${file}`));
					hasErrors = true;
				}
			}

			// Validate feature dependencies
			if (config.features) {
				for (const feature of config.features) {
					if (feature.requires) {
						for (const required of feature.requires) {
							const requiredFeature = config.features.find(f => f.name === required);
							if (!requiredFeature) {
								console.log(
									kleur.red(
										`  ✗ Feature '${feature.name}' requires '${required}' which is not defined`
									)
								);
								hasErrors = true;
							}
						}
					}
				}
			}

		} catch (error) {
			console.log(kleur.red(`  ✗ Failed to validate: ${error}`));
			hasErrors = true;
		}
	}

	// Summary
	console.log("\n" + "=".repeat(50));
	if (hasErrors) {
		console.log(kleur.red("\n❌ Validation failed with errors\n"));
		process.exit(1);
	} else {
		console.log(kleur.green("\n✅ All templates validated successfully\n"));
	}
}

// Run validation
validateAllTemplates().catch((error) => {
	console.error(kleur.red("\n❌ Validation failed:"), error);
	process.exit(1);
});