/**
 * Core type definitions for create-vinoflare
 */

// Project configuration types
export interface ProjectConfig {
	name: string;
	type: "full-stack" | "api-only";
	features: FeatureFlags;
	packageManager: PackageManager;
	git: boolean;
	install: boolean;
	skipInit: boolean;
}

export interface FeatureFlags {
	database: boolean;
	auth: boolean;
}

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

// Command line types
export interface CommandFlags {
	noInstall: boolean;
	noGit: boolean;
	yes: boolean;
	projectType?: "full-stack" | "api-only";
	noDb: boolean;
	noAuth: boolean;
	skipInit: boolean;
	packageManager?: string;
	help: boolean;
}

export interface ParsedArgs {
	projectName?: string;
	flags: CommandFlags;
}

// Template types
export interface Template {
	name: string;
	description: string;
	path: string;
	features: TemplateFeature[];
	scripts: TemplateScripts;
}

export interface TemplateFeature {
	name: string;
	enabled: boolean;
	optional: boolean;
	requires?: string[];
	conflicts?: string[];
	files: {
		remove?: string[];
		add?: Record<string, string>;
		transform?: Record<string, string>;
	};
	dependencies?: {
		add?: Record<string, string>;
		remove?: string[];
	};
}

export interface TransformRule {
	type: "function" | "replace" | "regex" | "json";
	transformer: string;
	options?: any;
	condition?: string;
}

export interface TemplateScripts {
	init?: string[];
	dev?: string;
	build?: string;
	[key: string]: string | string[] | undefined;
}

// Execution context
export interface ExecutionContext {
	projectPath: string;
	config: ProjectConfig;
	template: Template;
	logger: Logger;
	state: Map<string, any>;

	// Methods
	getState<T>(key: string): T | undefined;
	setState(key: string, value: any): void;
	hasFeature(featureName: string): boolean;
	getFeature(featureName: string): TemplateFeature | undefined;
}

// Logger interface
export interface Logger {
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	success(message: string): void;
	debug(message: string): void;
}

// Processor interface
export interface Processor {
	name: string;
	order: number;

	shouldRun(context: ExecutionContext): boolean;
	process(context: ExecutionContext): Promise<void>;
	rollback?(context: ExecutionContext): Promise<void>;
}

// File transformer interface
export interface FileTransformer {
	canTransform(file: string): boolean;
	transform(
		content: string,
		rule: TransformRule,
		context: ExecutionContext,
	): string;
}

// Transform options
export interface TransformOptions {
	rule: TransformRule;
	context: ExecutionContext;
	filePath: string;
}
