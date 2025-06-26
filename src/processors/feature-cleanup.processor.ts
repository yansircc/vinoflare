import path from "node:path";
import fs from "fs-extra";
import type { ExecutionContext } from "../types";
import { removeFiles } from "../utils/fs";
import { BaseProcessor } from "./types";

/**
 * Processor for cleaning up files based on disabled features
 */
export class FeatureCleanupProcessor extends BaseProcessor {
	name = "feature-cleanup";
	order = 30;

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.info("Processing feature configuration...");
		
		// Debug: write to file
		const debugPath = path.join(process.cwd(), "feature-cleanup-debug.log");
		await fs.appendFile(
			debugPath,
			`\n[${new Date().toISOString()}] FeatureCleanupProcessor started for project: ${context.projectPath}\n`
		);
		await fs.appendFile(
			debugPath,
			`Config: database=${context.config.features.database}, auth=${context.config.features.auth}\n`
		);
		await fs.appendFile(
			debugPath,
			`Template features: ${context.template.features.map(f => f.name).join(", ")}\n`
		);

		// Process template features
		for (const feature of context.template.features) {
			const msg = `[FEATURE-CLEANUP] Checking feature '${feature.name}': optional=${feature.optional}, enabled=${context.hasFeature(feature.name)}`;
			console.log(msg);
			await fs.appendFile(debugPath, msg + "\n");
			
			// Skip if feature is enabled
			if (!feature.optional || context.hasFeature(feature.name)) {
				const skipMsg = `[FEATURE-CLEANUP] Skipping ${feature.name} - enabled or not optional`;
				console.log(skipMsg);
				await fs.appendFile(debugPath, skipMsg + "\n");
				continue;
			}

			// Check dependencies
			if (feature.requires) {
				const missingDeps = feature.requires.filter(
					(dep) => !context.hasFeature(dep),
				);
				if (missingDeps.length > 0) {
					context.logger.warn(
						`Feature '${feature.name}' requires: ${missingDeps.join(", ")}`,
					);
				}
			}

			// Remove files for disabled feature
			if (feature.files.remove) {
				const removeMsg = `[FEATURE-CLEANUP] Removing files for disabled feature: ${feature.name}`;
				console.log(removeMsg);
				await fs.appendFile(debugPath, removeMsg + "\n");
				
				const filesMsg = `[FEATURE-CLEANUP] Files to remove: ${feature.files.remove.join(", ")}`;
				console.log(filesMsg);
				await fs.appendFile(debugPath, filesMsg + "\n");
				
				await removeFiles(context.projectPath, feature.files.remove);
			}
		}

		// Handle project-type specific cleanup
		if (context.config.type === "full-stack" && !context.hasFeature("auth")) {
			const authClientFiles = [
				"src/client/routes/login.tsx",
				"src/client/routes/profile.tsx",
			];
			await removeFiles(context.projectPath, authClientFiles);
		}

		context.logger.success("Feature configuration processed");
	}
}
