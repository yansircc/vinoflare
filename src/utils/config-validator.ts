import type { 
	TemplateConfig, 
	FeatureConfig, 
	FileTransformConfig,
	TransformRule 
} from "../types/template-config";
import type { TransformRulesConfig } from "../types/config";
import { getLogger } from "./logger";

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validates template and transform rule configurations
 */
export class ConfigValidator {
	private logger = getLogger();

	/**
	 * Validate a template configuration
	 */
	validateTemplateConfig(config: TemplateConfig): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Validate required fields
		if (!config.name) {
			errors.push("Template name is required");
		}

		if (!config.description) {
			warnings.push("Template description is recommended");
		}

		// Validate features
		if (config.features) {
			for (const feature of config.features) {
				const featureResult = this.validateFeature(feature);
				errors.push(...featureResult.errors);
				warnings.push(...featureResult.warnings);
			}
		}

		// Validate inheritance
		if (config.extends) {
			const extendsArray = Array.isArray(config.extends) 
				? config.extends 
				: [config.extends];
			
			for (const base of extendsArray) {
				if (!base || typeof base !== "string") {
					errors.push("Invalid extends value - must be a string");
				}
			}
		}

		// Validate transforms
		if (config.transforms) {
			for (const transform of config.transforms) {
				const transformResult = this.validateTransform(transform);
				errors.push(...transformResult.errors);
				warnings.push(...transformResult.warnings);
			}
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Validate a feature configuration
	 */
	private validateFeature(feature: FeatureConfig): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		if (!feature.name) {
			errors.push("Feature name is required");
		}

		// Validate dependencies
		if (feature.requires) {
			if (!Array.isArray(feature.requires)) {
				errors.push(`Feature ${feature.name}: requires must be an array`);
			}
		}

		// Validate file patterns
		if (feature.files?.remove) {
			for (const pattern of feature.files.remove) {
				if (typeof pattern !== "string") {
					errors.push(`Feature ${feature.name}: remove patterns must be strings`);
				}
			}
		}

		// Validate replacements
		if (feature.files?.add) {
			for (const replacement of feature.files.add) {
				if (!replacement.from || !replacement.to) {
					errors.push(`Feature ${feature.name}: replacements must have 'from' and 'to' fields`);
				}
			}
		}

		// Validate dependencies to remove
		if (feature.dependencies?.remove) {
			if (!Array.isArray(feature.dependencies.remove)) {
				errors.push(`Feature ${feature.name}: dependencies.remove must be an array`);
			}
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	/**
	 * Validate a file transform configuration
	 */
	private validateTransform(transform: FileTransformConfig): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		if (!transform.file) {
			errors.push("Transform file path is required");
		}

		if (!transform.rules || !Array.isArray(transform.rules)) {
			errors.push(`Transform ${transform.file}: rules must be an array`);
		} else {
			for (const rule of transform.rules) {
				const ruleResult = this.validateTransformRule(rule, transform.file);
				errors.push(...ruleResult.errors);
				warnings.push(...ruleResult.warnings);
			}
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	/**
	 * Validate a transform rule
	 */
	private validateTransformRule(rule: TransformRule, file: string): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		if (!rule.type || !["json", "function"].includes(rule.type)) {
			errors.push(`Transform ${file}: rule type must be 'json' or 'function'`);
		}

		if (!rule.transformer) {
			errors.push(`Transform ${file}: transformer name is required`);
		}

		// Validate known transformers
		const knownTransformers: Record<string, string[]> = {
			json: ["removeKeys", "addKeys", "updateValues"],
			function: [
				"removeImport",
				"removeStatement",
				"removeBlock",
				"replaceCode",
				"removeJSXElement",
				"addImport",
				"updateImport"
			],
			replace: [],
			regex: []
		};

		if (rule.type && knownTransformers[rule.type]) {
			if (!knownTransformers[rule.type].includes(rule.transformer)) {
				warnings.push(
					`Transform ${file}: unknown ${rule.type} transformer '${rule.transformer}'`
				);
			}
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	/**
	 * Validate transform rules configuration
	 */
	validateTransformRules(config: TransformRulesConfig): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Validate features
		if (config.features) {
			for (const [featureName, featureConfig] of Object.entries(config.features)) {
				if (featureConfig.files?.transform) {
					for (const transform of featureConfig.files.transform) {
						const result = this.validateTransform(transform);
						errors.push(...result.errors.map(e => `Feature ${featureName}: ${e}`));
						warnings.push(...result.warnings.map(w => `Feature ${featureName}: ${w}`));
					}
				}
			}
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Validate that all required files exist in the template
	 */
	async validateTemplateFiles(
		templatePath: string,
		config: TemplateConfig
	): Promise<ValidationResult> {
		const errors: string[] = [];
		const warnings: string[] = [];
		const { pathExists } = await import("fs-extra");

		// Check if template path exists
		if (!(await pathExists(templatePath))) {
			errors.push(`Template path does not exist: ${templatePath}`);
			return { valid: false, errors, warnings };
		}

		// Validate transform target files exist
		if (config.transforms) {
			for (const transform of config.transforms) {
				const filePath = `${templatePath}/${transform.file}`;
				if (!(await pathExists(filePath))) {
					warnings.push(`Transform target file not found: ${transform.file}`);
				}
			}
		}

		// Validate replacement source files
		if (config.features) {
			for (const feature of config.features) {
				if (feature.files?.add) {
					for (const replacement of feature.files.add) {
						// Check common replacement locations
						const possiblePaths = [
							`${templatePath}/../replacements/${replacement.from}`,
							`${templatePath}/replacements/${replacement.from}`,
						];
						
						let found = false;
						for (const path of possiblePaths) {
							if (await pathExists(path)) {
								found = true;
								break;
							}
						}
						
						if (!found) {
							warnings.push(
								`Feature ${feature.name}: replacement source not found: ${replacement.from}`
							);
						}
					}
				}
			}
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Log validation results
	 */
	logValidationResult(result: ValidationResult, name: string): void {
		if (result.errors.length > 0) {
			this.logger.error(`Validation failed for ${name}:`);
			result.errors.forEach(error => this.logger.error(`  - ${error}`));
		}

		if (result.warnings.length > 0) {
			this.logger.warn(`Validation warnings for ${name}:`);
			result.warnings.forEach(warning => this.logger.warn(`  - ${warning}`));
		}

		if (result.valid && result.warnings.length === 0) {
			this.logger.success(`Validation passed for ${name}`);
		}
	}
}