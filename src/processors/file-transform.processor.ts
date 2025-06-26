import path from "node:path";
import transformRules from "../../config/transform-rules.json";
import { transformerManager } from "../templates/transformers";
import type { ExecutionContext } from "../types";
import type { TransformRulesConfig, FileTransform } from "../types/config";
import { ConditionEvaluator } from "../utils/condition-evaluator";
import { createFileOperations } from "../utils/file-operations";
import { BaseProcessor } from "./types";

/**
 * Processor that handles file transformations based on configuration
 */
export class FileTransformProcessor extends BaseProcessor {
	name = "file-transform";
	order = 40; // Run after feature cleanup

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.info("Applying file transformations...");

		// Process feature-based transformations
		const rules = transformRules as TransformRulesConfig;
		for (const [featureName, featureConfig] of Object.entries(
			rules.features,
		)) {
			if (!this.shouldProcessFeature(featureName, context)) {
				continue;
			}

			if (featureConfig.files?.transform) {
				await this.processTransformations(
					context,
					featureConfig.files.transform,
				);
			}
		}

		// Process project-type based transformations (if exists)
		const projectTypes = (rules as any).projectTypes;
		if (projectTypes && projectTypes[context.config.type]?.files?.transform) {
			await this.processTransformations(
				context,
				projectTypes[context.config.type].files.transform,
			);
		}

		context.logger.success("File transformations completed");
	}

	private shouldProcessFeature(
		featureName: string,
		context: ExecutionContext,
	): boolean {
		// If feature is disabled, we need to process its transformations
		return !context.hasFeature(featureName);
	}

	private async processTransformations(
		context: ExecutionContext,
		transformations: any[],
	): Promise<void> {
		const fileOps = createFileOperations(context.projectPath);

		for (const transformation of transformations) {
			// Check condition if specified
			if (
				transformation.condition &&
				!this.evaluateCondition(transformation.condition, context)
			) {
				continue;
			}

			if (!(await fileOps.exists(transformation.file))) {
				context.logger.debug(
					`File not found for transformation: ${transformation.file}`,
				);
				continue;
			}

			try {
				let content = await fileOps.read(transformation.file);

				// Apply rules
				if (transformation.rules) {
					const filePath = path.join(context.projectPath, transformation.file);
					content = await transformerManager.transformFile(
						filePath,
						content,
						transformation.rules,
						context,
					);
				}

				await fileOps.write(transformation.file, content);
				context.logger.debug(`Transformed: ${transformation.file}`);
			} catch (error) {
				context.logger.error(
					`Failed to transform ${transformation.file}: ${error}`,
				);
			}
		}
	}

	private evaluateCondition(
		condition: string,
		context: ExecutionContext,
	): boolean {
		const conditions: Record<string, any> = {
			hasDatabase: context.hasFeature("database"),
			hasAuth: context.hasFeature("auth"),
			isApiOnly: context.config.type === "api-only",
			isFullStack: context.config.type === "full-stack",
		};

		const evaluator = new ConditionEvaluator(conditions);
		return evaluator.evaluate(condition);
	}
}
