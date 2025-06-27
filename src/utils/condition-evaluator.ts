/**
 * Safe condition evaluator without using eval()
 */
export class ConditionEvaluator {
	private context: Record<string, any>;

	constructor(context: Record<string, any>) {
		this.context = context;
	}

	/**
	 * Evaluate a condition expression safely
	 */
	evaluate(expression: string): boolean {
		// Remove whitespace
		const trimmedExpression = expression.trim();

		// Handle simple boolean values
		if (trimmedExpression === "true") return true;
		if (trimmedExpression === "false") return false;

		// Handle negation
		if (trimmedExpression.startsWith("!")) {
			return !this.evaluate(trimmedExpression.substring(1));
		}

		// Handle parentheses
		if (trimmedExpression.startsWith("(") && trimmedExpression.endsWith(")")) {
			return this.evaluate(trimmedExpression.slice(1, -1));
		}

		// Handle AND operations
		if (trimmedExpression.includes("&&")) {
			const parts = this.splitByOperator(trimmedExpression, "&&");
			return parts.every((part) => this.evaluate(part));
		}

		// Handle OR operations
		if (trimmedExpression.includes("||")) {
			const parts = this.splitByOperator(trimmedExpression, "||");
			return parts.some((part) => this.evaluate(part));
		}

		// Handle comparisons
		if (trimmedExpression.includes("===")) {
			const [left, right] = this.splitByOperator(trimmedExpression, "===");
			return this.getValue(left) === this.getValue(right);
		}

		if (trimmedExpression.includes("!==")) {
			const [left, right] = this.splitByOperator(trimmedExpression, "!==");
			return this.getValue(left) !== this.getValue(right);
		}

		if (trimmedExpression.includes("==")) {
			const [left, right] = this.splitByOperator(trimmedExpression, "==");
			return this.getValue(left) === this.getValue(right);
		}

		if (trimmedExpression.includes("!=")) {
			const [left, right] = this.splitByOperator(trimmedExpression, "!=");
			return this.getValue(left) !== this.getValue(right);
		}

		// Simple variable lookup
		return Boolean(this.getValue(trimmedExpression));
	}

	/**
	 * Split trimmedExpression by operator, respecting parentheses
	 */
	private splitByOperator(
		trimmedExpression: string,
		operator: string,
	): string[] {
		const parts: string[] = [];
		let current = "";
		let depth = 0;
		let i = 0;

		while (i < trimmedExpression.length) {
			if (trimmedExpression[i] === "(") {
				depth++;
			} else if (trimmedExpression[i] === ")") {
				depth--;
			} else if (
				depth === 0 &&
				trimmedExpression.substring(i, i + operator.length) === operator
			) {
				parts.push(current.trim());
				current = "";
				i += operator.length - 1;
			} else {
				current += trimmedExpression[i];
			}
			i++;
		}

		if (current) {
			parts.push(current.trim());
		}

		return parts;
	}

	/**
	 * Get value from context or parse as literal
	 */
	private getValue(key: string): any {
		const trimmedKey = key.trim();

		// Remove quotes if string literal
		if (
			(trimmedKey.startsWith('"') && trimmedKey.endsWith('"')) ||
			(trimmedKey.startsWith("'") && trimmedKey.endsWith("'"))
		) {
			return trimmedKey.slice(1, -1);
		}

		// Check if it's a number
		const num = Number(trimmedKey);
		if (!Number.isNaN(num)) {
			return num;
		}

		// Check if it's a boolean
		if (trimmedKey === "true") return true;
		if (trimmedKey === "false") return false;
		if (trimmedKey === "null") return null;
		if (trimmedKey === "undefined") return undefined;

		// Handle function calls
		if (trimmedKey.includes("(") && trimmedKey.endsWith(")")) {
			const funcMatch = trimmedKey.match(/^(\w+)\((.*)\)$/);
			if (funcMatch) {
				const [, funcName, args] = funcMatch;
				const func = this.context[funcName];
				if (typeof func === "function") {
					// Parse arguments
					const argValues = args
						.split(",")
						.map((arg) => arg.trim())
						.filter((arg) => arg)
						.map((arg) => {
							// Remove quotes from string arguments
							if (
								(arg.startsWith('"') && arg.endsWith('"')) ||
								(arg.startsWith("'") && arg.endsWith("'"))
							) {
								return arg.slice(1, -1);
							}
							return arg;
						});
					return func(...argValues);
				}
			}
		}

		// Look up in context
		return this.context[trimmedKey];
	}
}
