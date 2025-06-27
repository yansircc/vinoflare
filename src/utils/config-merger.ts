import type { TransformRulesConfig } from "../types/config";
import type {
	FileTransformConfig,
	TemplateConfig,
	UnifiedTemplateConfig,
} from "../types/template-config";

/**
 * Merges template configuration with transform rules
 */
export class ConfigMerger {
	/**
	 * Merge template config with transform rules to create a unified configuration
	 */
	static merge(
		templateConfig: TemplateConfig,
		transformRules: TransformRulesConfig,
	): UnifiedTemplateConfig {
		const transforms: FileTransformConfig[] = [
			...(templateConfig.transforms || []),
		];

		// Add transforms from feature-based rules
		for (const [featureName, featureConfig] of Object.entries(
			transformRules.features || {},
		)) {
			if (featureConfig.files?.transform) {
				for (const transformConfig of featureConfig.files.transform) {
					// Feature transforms should be applied when the feature is NOT present
					// (e.g., database transforms remove DB-related code when no DB)
					// Unless the transform already has a condition specified
					const defaultCondition = `!hasFeature("${featureName}")`;
					const finalCondition = transformConfig.condition || defaultCondition;
					
					
					const modifiedTransform: FileTransformConfig = {
						...transformConfig,
						condition: finalCondition,
						rules: transformConfig.rules.map((rule) => ({
							...rule,
							// Preserve existing conditions
							condition: rule.condition || transformConfig.condition,
						})),
					};
					transforms.push(modifiedTransform);
				}
			}
		}

		// Add transforms from project-type based rules
		const projectTypes = (transformRules as any).projectTypes;
		if (projectTypes) {
			for (const [projectType, typeConfig] of Object.entries(projectTypes)) {
				if ((typeConfig as any).files?.transform) {
					for (const transformConfig of (typeConfig as any).files.transform) {
						// Add project type condition
						const modifiedTransform: FileTransformConfig = {
							...transformConfig,
							condition: `projectType === "${projectType}"`,
							rules: transformConfig.rules,
						};
						transforms.push(modifiedTransform);
					}
				}
			}
		}

		return {
			...templateConfig,
			transforms,
		};
	}

	/**
	 * Merge parent template config with child template config
	 */
	static mergeInheritance(
		parent: TemplateConfig,
		child: TemplateConfig,
	): TemplateConfig {
		return {
			...parent,
			...child,
			// Merge features
			features: ConfigMerger.mergeFeatures(
				parent.features || [],
				child.features || [],
			),
			// Child scripts override parent scripts
			scripts: {
				...parent.scripts,
				...child.scripts,
			},
			// Merge transforms
			transforms: [...(parent.transforms || []), ...(child.transforms || [])],
		};
	}

	/**
	 * Merge feature configurations
	 */
	private static mergeFeatures(
		parentFeatures: TemplateConfig["features"],
		childFeatures: TemplateConfig["features"],
	): TemplateConfig["features"] {
		const featureMap = new Map();

		// Add parent features
		for (const feature of parentFeatures || []) {
			featureMap.set(feature.name, feature);
		}

		// Override with child features
		for (const feature of childFeatures || []) {
			const existing = featureMap.get(feature.name);
			if (existing) {
				// Merge the feature configurations
				featureMap.set(feature.name, {
					...existing,
					...feature,
					files: {
						...existing.files,
						...feature.files,
						remove: [
							...(existing.files?.remove || []),
							...(feature.files?.remove || []),
						],
						add: [
							...(existing.files?.add || []),
							...(feature.files?.add || []),
						],
					},
					dependencies: {
						...existing.dependencies,
						...feature.dependencies,
						remove: [
							...(existing.dependencies?.remove || []),
							...(feature.dependencies?.remove || []),
						],
					},
				});
			} else {
				featureMap.set(feature.name, feature);
			}
		}

		return Array.from(featureMap.values());
	}
}
