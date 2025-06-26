import path from "node:path";
import { transformerManager } from "../templates/transformers";
import type { ExecutionContext, Processor } from "../types";
import type { UnifiedTemplateConfig } from "../types/template-config";
import { ConditionEvaluator } from "../utils/condition-evaluator";
import { createFileOperations } from "../utils/file-operations";
import { getLogger } from "../utils/logger";

/**
 * File transformation processor that uses unified configuration
 */
export class FileTransformProcessor implements Processor {
	name = "file-transform";
	order = 40; // Run after feature cleanup
	private logger = getLogger();

	shouldRun(): boolean {
		return true;
	}

	async process(context: ExecutionContext): Promise<void> {
		this.logger.info("Applying file transformations...");

		const unifiedConfig = context.getState<UnifiedTemplateConfig>("unifiedConfig");
		if (!unifiedConfig?.transforms) {
			this.logger.debug("No transformations found in unified config");
			return;
		}

		const fileOps = createFileOperations(context.projectPath);

		for (const transform of unifiedConfig.transforms) {
			// Check transformation condition
			if (
				transform.condition &&
				!this.evaluateCondition(transform.condition, context)
			) {
				this.logger.debug(
					`Skipping transformation for ${transform.file} - condition not met: ${transform.condition}`,
				);
				continue;
			}

			// Check if file exists
			if (!(await fileOps.exists(transform.file))) {
				this.logger.debug(
					`File not found for transformation: ${transform.file}`,
				);
				continue;
			}

			try {
				let content = await fileOps.read(transform.file);

				// Apply rules
				const filePath = path.join(context.projectPath, transform.file);
				content = await transformerManager.transformFile(
					filePath,
					content,
					transform.rules,
					context,
				);

				await fileOps.write(transform.file, content);
				this.logger.debug(`Transformed: ${transform.file}`);
			} catch (error) {
				this.logger.error(
					`Failed to transform ${transform.file}: ${error}`,
				);
			}
		}

		this.logger.success("File transformations completed");
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
			projectType: context.config.type,
			// Add helper function for feature checking
			hasFeature: (name: string) => context.hasFeature(name),
		};

		const evaluator = new ConditionEvaluator(conditions);
		return evaluator.evaluate(condition);
	}
}