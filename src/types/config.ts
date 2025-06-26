/**
 * Type definitions for transform rules and template configuration
 */

// Transform Rules Types
export interface TransformRule {
	type: "function" | "replace";
	transformer: string;
	options?: Record<string, any>;
}

// Specific transformer options
export interface RemoveDependencyOptions {
	dependencies: string[];
}

export interface RemoveScriptOptions {
	scripts: string[];
}

export interface UpdateFieldOptions {
	field: string;
	value: any;
}

export interface RemoveFieldOptions {
	field: string;
}

export interface RemoveImportOptions {
	module: string;
}

export interface RemoveExportOptions {
	pattern: string;
}

export interface RemoveBlockOptions {
	startPattern: string;
	endPattern: string;
}

export interface FileTransform {
	file: string;
	condition?: string;
	rules: TransformRule[];
}

export interface FeatureTransform {
	files: {
		remove?: string[];
		transform?: FileTransform[];
	};
}

export interface TransformRulesConfig {
	features: Record<string, FeatureTransform>;
	dependencies?: Record<string, Record<string, DependencyTransform>>;
}

export interface DependencyTransform {
	remove: string[];
	devDependencies?: string[];
}

// Template Configuration Types
export interface TemplateFeature {
	name: string;
	enabled: boolean;
	optional: boolean;
	requires?: string[];
	files?: {
		remove?: string[];
		replace?: Record<string, string>;
	};
}

export interface TemplateConfig {
	name: string;
	description: string;
	features: TemplateFeature[];
	scripts?: {
		init?: string[];
		initWithDb?: string[];
		dev?: string;
		build?: string;
		lint?: string;
		[key: string]: string | string[] | undefined;
	};
}

// Validation helpers
export function isValidTransformRule(rule: any): rule is TransformRule {
	return (
		rule &&
		typeof rule === "object" &&
		["function", "replace"].includes(rule.type) &&
		typeof rule.transformer === "string"
	);
}

export function isValidTemplateConfig(config: any): config is TemplateConfig {
	return (
		config &&
		typeof config === "object" &&
		typeof config.name === "string" &&
		typeof config.description === "string" &&
		Array.isArray(config.features) &&
		config.features.every(
			(f: any) =>
				typeof f.name === "string" &&
				typeof f.enabled === "boolean" &&
				typeof f.optional === "boolean",
		)
	);
}