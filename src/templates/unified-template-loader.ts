import path from "node:path";
import { fileURLToPath } from "node:url";
import transformRules from "../../config/transform-rules.json";
import type { Template } from "../types";
import type { TransformRulesConfig } from "../types/config";
import type { TemplateConfig, UnifiedTemplateConfig } from "../types/template-config";
import { ConfigMerger } from "../utils/config-merger";
import { pathExists, readJSON } from "../utils/fs";
import { getLogger } from "../utils/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Enhanced template loader that supports unified configuration
 */
export class UnifiedTemplateLoader {
	private templatesDir: string;
	private logger = getLogger();
	private templateCache = new Map<string, UnifiedTemplateConfig>();

	constructor(templatesDir?: string) {
		this.templatesDir = templatesDir || path.join(__dirname, "../../templates");
	}

	/**
	 * Load a template with unified configuration
	 */
	async loadUnifiedTemplate(templateName: string): Promise<UnifiedTemplateConfig> {
		// Check cache
		if (this.templateCache.has(templateName)) {
			return this.templateCache.get(templateName)!;
		}

		const templatePath = path.join(this.templatesDir, templateName);
		const configPath = path.join(templatePath, "template.json");

		// Check if template exists
		if (!(await pathExists(templatePath))) {
			throw new Error(`Template '${templateName}' not found`);
		}

		// Load template configuration
		let templateConfig: TemplateConfig = {
			name: templateName,
			description: `${templateName} template`,
		};

		if (await pathExists(configPath)) {
			try {
				const rawConfig = await readJSON(configPath);
				templateConfig = rawConfig as TemplateConfig;
			} catch (error) {
				this.logger.warn(`Failed to load template config for '${templateName}'`);
			}
		}

		// Handle template inheritance
		if (templateConfig.extends) {
			templateConfig = await this.resolveInheritance(templateConfig);
		}

		// Merge with transform rules
		const unifiedConfig = ConfigMerger.merge(
			templateConfig,
			transformRules as TransformRulesConfig,
		);

		// Add template path
		(unifiedConfig as any).path = templatePath;

		// Cache the result
		this.templateCache.set(templateName, unifiedConfig);

		return unifiedConfig;
	}

	/**
	 * Resolve template inheritance
	 */
	private async resolveInheritance(
		templateConfig: TemplateConfig,
	): Promise<TemplateConfig> {
		if (!templateConfig.extends) {
			return templateConfig;
		}

		const baseTemplates = Array.isArray(templateConfig.extends)
			? templateConfig.extends
			: [templateConfig.extends];

		let mergedConfig = templateConfig;

		// Load and merge each base template
		for (const baseTemplateName of baseTemplates) {
			const baseTemplate = await this.loadUnifiedTemplate(baseTemplateName);
			mergedConfig = ConfigMerger.mergeInheritance(baseTemplate, mergedConfig);
		}

		// Remove extends property from final config
		delete mergedConfig.extends;

		return mergedConfig;
	}

	/**
	 * Convert unified config to legacy Template format for compatibility
	 */
	toTemplate(unifiedConfig: UnifiedTemplateConfig): Template {
		return {
			name: unifiedConfig.name,
			description: unifiedConfig.description,
			path: (unifiedConfig as any).path,
			features: unifiedConfig.features?.map((feature) => ({
				name: feature.name,
				enabled: feature.enabled,
				optional: feature.optional,
				requires: feature.requires || [],
				conflicts: [],
				files: {
					remove: feature.files?.remove || [],
					add: {},
					transform: feature.files?.transform || {},
				},
				dependencies: {
					add: {},
					remove: feature.dependencies?.remove || [],
				},
			})) || [],
			scripts: unifiedConfig.scripts || {},
		};
	}

	/**
	 * Get available templates
	 */
	async getAvailableTemplates(): Promise<string[]> {
		const fs = await import("node:fs/promises");
		const entries = await fs.readdir(this.templatesDir, {
			withFileTypes: true,
		});

		return entries
			.filter((entry) => entry.isDirectory())
			.filter((entry) => entry.name !== "shared") // Exclude shared template from user selection
			.map((entry) => entry.name);
	}
}