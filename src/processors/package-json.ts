import path from "node:path";
import type { ExecutionContext } from "../types";
import { readJSON, writeJSON } from "../utils/fs-extra-wrapper";
import { BaseProcessor } from "./types";

/**
 * Processor for updating package.json
 */
export class PackageJsonProcessor extends BaseProcessor {
	name = "package-json";
	order = 20;

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.info("Updating package.json...");

		const packageJsonPath = path.join(context.projectPath, "package.json");
		const packageJson = await readJSON(packageJsonPath);

		// Update project name
		// If project name is ".", use the current directory name
		const projectName =
			context.config.name === "."
				? path.basename(context.projectPath)
				: context.config.name;
		packageJson.name = projectName;

		// Process features
		for (const feature of context.template.features) {
			if (!feature.optional || context.hasFeature(feature.name)) {
				continue;
			}

			// Remove dependencies for disabled features
			if (feature.dependencies?.remove) {
				for (const dep of feature.dependencies.remove) {
					delete packageJson.dependencies?.[dep];
					delete packageJson.devDependencies?.[dep];
				}
			}
		}

		await writeJSON(packageJsonPath, packageJson);
		context.logger.success("package.json updated");
	}
}
