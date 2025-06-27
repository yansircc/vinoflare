import type { ExecutionContext, Processor } from "../types";
import type { UnifiedTemplateConfig } from "../types/template-config";
import { createFileOperations } from "../utils/file-operations";
import { getLogger } from "../utils/logger";

/**
 * Feature cleanup processor that uses rules from unified configuration
 */
export class FeatureCleanupProcessor implements Processor {
	name = "feature-cleanup";
	order = 30; // Run after package.json update
	private logger = getLogger();

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		this.logger.info("Cleaning up disabled features...");

		const unifiedConfig =
			context.getState<UnifiedTemplateConfig>("unifiedConfig");
		if (!unifiedConfig?.features) {
			this.logger.debug("No features found in unified config");
			return;
		}

		const fileOps = createFileOperations(context.projectPath);
		const allFilesToRemove: string[] = [];
		const filesToAdd: Array<{ from: string; to: string }> = [];

		// Process each feature
		for (const feature of unifiedConfig.features) {
			// Skip if feature is enabled
			if (context.hasFeature(feature.name)) {
				this.logger.debug(
					`Feature '${feature.name}' is enabled - skipping cleanup`,
				);
				continue;
			}

			// Skip if feature is not optional
			if (!feature.optional) {
				this.logger.debug(
					`Feature '${feature.name}' is required - skipping cleanup`,
				);
				continue;
			}

			this.logger.info(`Removing files for disabled feature: ${feature.name}`);

			// Collect files to remove
			if (feature.files?.remove) {
				allFilesToRemove.push(...feature.files.remove);
			}

			// Collect files to add (replacements)
			if (feature.files?.add) {
				filesToAdd.push(...feature.files.add);
			}

			// Remove dependencies
			if (feature.dependencies?.remove) {
				await this.removeDependencies(context, feature.dependencies.remove);
			}
		}

		// Remove all files at once
		if (allFilesToRemove.length > 0) {
			await fileOps.removeFiles(allFilesToRemove);
		}

		// Add replacement files
		for (const { from, to } of filesToAdd) {
			try {
				const sourcePath = this.resolveReplacementPath(context, from);
				await fileOps.copy(sourcePath, to);
				this.logger.debug(`Added replacement file: ${to}`);
			} catch (error) {
				this.logger.error(`Failed to add replacement file ${to}: ${error}`);
			}
		}

		// Handle special cases (client-side updates for no-db)
		await this.handleSpecialCases(context);

		this.logger.success("Feature cleanup completed");
	}

	private async removeDependencies(
		context: ExecutionContext,
		dependencies: string[],
	): Promise<void> {
		const packageJsonPath = "package.json";
		const fileOps = createFileOperations(context.projectPath);

		try {
			const packageJson = JSON.parse(await fileOps.read(packageJsonPath));
			let modified = false;

			for (const dep of dependencies) {
				if (packageJson.dependencies?.[dep]) {
					delete packageJson.dependencies[dep];
					modified = true;
				}
				if (packageJson.devDependencies?.[dep]) {
					delete packageJson.devDependencies[dep];
					modified = true;
				}
			}

			if (modified) {
				await fileOps.write(
					packageJsonPath,
					JSON.stringify(packageJson, null, 2) + "\n",
				);
				this.logger.debug(`Removed dependencies: ${dependencies.join(", ")}`);
			}
		} catch (error) {
			this.logger.error(`Failed to remove dependencies: ${error}`);
		}
	}

	private resolveReplacementPath(
		context: ExecutionContext,
		from: string,
	): string {
		// Resolve replacement file path
		// Could be from templates/replacements or templates/shared/replacements
		const templatePath = context.getState<string>("templatePath");
		if (!templatePath) {
			throw new Error("Template path not found in context");
		}

		// Try different locations
		const possiblePaths = [
			`${templatePath}/../replacements/${from}`,
			`${templatePath}/../shared/replacements/${from}`,
			`templates/replacements/${from}`,
		];

		// Return the first valid path (actual validation happens in copy operation)
		return possiblePaths[0];
	}

	private async handleSpecialCases(_context: ExecutionContext): Promise<void> {
		// Special cases are now handled through configuration
		// This method is kept for future extensibility
	}
}
