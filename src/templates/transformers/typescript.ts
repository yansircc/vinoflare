import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import type { ExecutionContext, TransformRule } from "../../types";
import { createFileOperations } from "../../utils/file-operations";
import { BaseTransformer } from "./base";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Transformer for TypeScript files
 */
export class TypeScriptTransformer extends BaseTransformer {
	canTransform(file: string): boolean {
		return file.endsWith(".ts") || file.endsWith(".tsx");
	}

	transform(
		content: string,
		rule: TransformRule,
		context: ExecutionContext,
	): string {
		switch (rule.transformer) {
			case "removeImport":
				return this.removeImport(content, rule.options);
			case "removeExport":
				return this.removeExport(content, rule.options);
			case "removeType":
				return this.removeType(content, rule.options);
			case "removeFunction":
				return this.removeFunction(content, rule.options);
			case "replaceInterface":
				return this.replaceInterface(content, rule.options);
			case "replaceFile":
				return this.replaceFile(content, rule.options, context);
			case "removeStatement":
				return this.removeStatement(content, rule.options);
			case "removeBlock":
				return this.removeBlockTransform(content, rule.options);
			case "custom":
				return this.customTransform(content, rule.options, context);
			default:
				return content;
		}
	}

	private removeImport(content: string, options: any): string {
		const { module, imports } = options;
		if (imports && imports.length > 0) {
			// Remove specific imports
			const importPattern = new RegExp(
				`import\\s*{[^}]*(?:${imports.join("|")})[^}]*}\\s*from\\s*["']${module}["'];?\\n?`,
				"g",
			);
			return content.replace(importPattern, "");
		} else {
			// Remove entire import
			const importPattern = new RegExp(
				`import.*from\\s*["']${module}["'];?\\n?`,
				"g",
			);
			return content.replace(importPattern, "");
		}
	}

	private removeExport(content: string, options: any): string {
		const { pattern } = options;
		const exportPattern = new RegExp(`export.*${pattern}.*;?\\n?`, "g");
		return content.replace(exportPattern, "");
	}

	private removeType(content: string, options: any): string {
		const { typeName } = options;
		// Remove type definition and its usages
		const typePattern = new RegExp(
			`(?:export\\s+)?type\\s+${typeName}[\\s\\S]*?(?=\\n(?:export|type|interface|const|let|var|function|class|$))`,
			"g",
		);
		return content.replace(typePattern, "");
	}

	private removeFunction(content: string, options: any): string {
		const { functionName } = options;
		const functionPattern = new RegExp(
			`(?:export\\s+)?(?:async\\s+)?function\\s+${functionName}[\\s\\S]*?\\n}\\n?`,
			"g",
		);
		return content.replace(functionPattern, "");
	}

	private replaceInterface(content: string, options: any): string {
		const { interfaceName, newDefinition } = options;
		const interfacePattern = new RegExp(
			`(?:export\\s+)?interface\\s+${interfaceName}[\\s\\S]*?\\n}`,
			"g",
		);
		return content.replace(interfacePattern, newDefinition);
	}

	private removeStatement(content: string, options: any): string {
		const { pattern } = options;
		// Escape special regex characters in the pattern
		const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const statementPattern = new RegExp(`${escapedPattern}\\s*\\n?`, "g");
		return content.replace(statementPattern, "");
	}

	private removeBlockTransform(content: string, options: any): string {
		const { startPattern, endPattern } = options;
		const blockPattern = new RegExp(
			`${startPattern}[\\s\\S]*?${endPattern}\\s*\\n?`,
			"g",
		);
		return content.replace(blockPattern, "");
	}

	private replaceFile(
		content: string,
		options: any,
		context: ExecutionContext,
	): string {
		// Replace entire file content with template file
		const { template } = options;
		if (!template) {
			return content;
		}

		try {
			// The template path is relative to the project being created
			// We need to go up from the project path to find the CLI's templates
			const cliRoot = path.resolve(context.projectPath, "..");
			const templatePath = path.join(cliRoot, template);
			
			// Read template file synchronously for transformation
			const templateContent = fs.readFileSync(templatePath, "utf-8");
			return templateContent;
		} catch (error) {
			console.error(`Failed to read template file: ${template}`, error);
			// As a fallback, try the current working directory
			try {
				const fallbackPath = path.join(process.cwd(), template);
				const templateContent = fs.readFileSync(fallbackPath, "utf-8");
				return templateContent;
			} catch {
				return content;
			}
		}
	}

	private customTransform(
		content: string,
		options: any,
		context: ExecutionContext,
	): string {
		// Custom transformations based on context
		const { transform } = options;
		if (typeof transform === "function") {
			return transform(content, context);
		}
		return content;
	}
}
