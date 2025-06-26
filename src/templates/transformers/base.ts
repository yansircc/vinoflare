import type {
	ExecutionContext,
	FileTransformer,
	TransformRule,
} from "../../types";

/**
 * Base transformer class that all file transformers should extend
 */
export abstract class BaseTransformer implements FileTransformer {
	abstract canTransform(file: string): boolean;
	abstract transform(
		content: string,
		rule: TransformRule,
		context: ExecutionContext,
	): string;

	/**
	 * Helper method to safely replace content
	 */
	protected safeReplace(
		content: string,
		search: string | RegExp,
		replacement: string,
	): string {
		try {
			return content.replace(search, replacement);
		} catch (error) {
			console.error(`Error replacing content: ${error}`);
			return content;
		}
	}

	/**
	 * Helper method to remove code blocks
	 */
	protected removeBlock(
		content: string,
		startPattern: RegExp,
		endPattern?: RegExp,
	): string {
		if (endPattern) {
			// Remove block between start and end patterns
			const regex = new RegExp(
				`${startPattern.source}[\\s\\S]*?${endPattern.source}`,
				"g",
			);
			return content.replace(regex, "");
		} else {
			// Remove single line or until end of content
			return content.replace(startPattern, "");
		}
	}
}
