/**
 * Template configuration schema
 */

export interface TemplateConfig {
	/**
	 * Template name
	 */
	name: string;

	/**
	 * Template description
	 */
	description: string;

	/**
	 * Base template to inherit from
	 */
	extends?: string | string[];

	/**
	 * Features available in this template
	 */
	features?: FeatureConfig[];

	/**
	 * Scripts configuration
	 */
	scripts?: {
		init?: string[];
		initWithDb?: string[];
		dev?: string;
		build?: string;
		lint?: string;
	};

	/**
	 * File transformations to apply
	 */
	transforms?: FileTransformConfig[];
}

export interface FeatureConfig {
	/**
	 * Feature name
	 */
	name: string;

	/**
	 * Whether the feature is enabled by default
	 */
	enabled: boolean;

	/**
	 * Whether the feature is optional
	 */
	optional: boolean;

	/**
	 * Other features this feature depends on
	 */
	requires?: string[];

	/**
	 * Files configuration when feature is disabled
	 */
	files?: {
		/**
		 * Files to remove when feature is disabled
		 */
		remove?: string[];

		/**
		 * Files to transform when feature is disabled
		 */
		transform?: Record<string, string>;

		/**
		 * Files to add when feature is disabled
		 */
		add?: Array<{
			from: string;
			to: string;
		}>;
	};

	/**
	 * Dependencies to remove when feature is disabled
	 */
	dependencies?: {
		remove?: string[];
	};
}

export interface FileTransformConfig {
	/**
	 * File path to transform (relative to project root)
	 */
	file: string;

	/**
	 * Condition for applying this transformation
	 */
	condition?: string;

	/**
	 * Transformation rules to apply
	 */
	rules: TransformRule[];
}

export interface TransformRule {
	/**
	 * Type of transformation
	 */
	type: "json" | "function";

	/**
	 * Name of the transformer to use
	 */
	transformer: string;

	/**
	 * Options to pass to the transformer
	 */
	options?: any;

	/**
	 * Condition for applying this rule
	 */
	condition?: string;
}

/**
 * Unified configuration that merges template config and transform rules
 */
export interface UnifiedTemplateConfig extends TemplateConfig {
	/**
	 * All transformations (from both template.json and transform-rules.json)
	 */
	transforms: FileTransformConfig[];
}