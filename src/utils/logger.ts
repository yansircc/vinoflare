import kleur from "kleur";
import type { Logger } from "../types";

export interface LoggerOptions {
	debugMode?: boolean;
	silent?: boolean;
	prefix?: string;
}

/**
 * Enhanced logger implementation with additional features
 */
export class CLILogger implements Logger {
	private debugMode: boolean;
	private silent: boolean;
	private prefix: string;
	private indentLevel = 0;

	constructor(options: LoggerOptions | boolean = false) {
		// Support legacy boolean parameter for backward compatibility
		if (typeof options === "boolean") {
			this.debugMode = options;
			this.silent = false;
			this.prefix = "";
		} else {
			this.debugMode = options.debugMode ?? false;
			this.silent = options.silent ?? false;
			this.prefix = options.prefix ?? "";
		}
	}

	info(message: string): void {
		if (!this.silent) {
			console.log(this.formatMessage(message));
		}
	}

	warn(message: string): void {
		if (!this.silent) {
			console.log(kleur.yellow(this.formatMessage(`⚠️  ${message}`)));
		}
	}

	error(message: string): void {
		if (!this.silent) {
			console.error(kleur.red(this.formatMessage(`✖ ${message}`)));
		}
	}

	success(message: string): void {
		if (!this.silent) {
			console.log(kleur.green(this.formatMessage(`✓ ${message}`)));
		}
	}

	debug(message: string): void {
		if (this.debugMode && !this.silent) {
			console.log(kleur.gray(this.formatMessage(`[DEBUG] ${message}`)));
		}
	}

	/**
	 * Create a child logger with additional prefix
	 */
	child(prefix: string): CLILogger {
		return new CLILogger({
			debugMode: this.debugMode,
			silent: this.silent,
			prefix: this.prefix ? `${this.prefix} > ${prefix}` : prefix,
		});
	}

	/**
	 * Format message with prefix and indentation
	 */
	private formatMessage(message: string): string {
		const parts: string[] = [];

		if (this.prefix) {
			parts.push(kleur.cyan(`[${this.prefix}]`));
		}

		const indent = "  ".repeat(this.indentLevel);
		parts.push(indent + message);

		return parts.join(" ");
	}
}

// Singleton instance
let logger: Logger | null = null;

export function createLogger(options: LoggerOptions | boolean = false): Logger {
	if (!logger) {
		logger = new CLILogger(options);
	}
	return logger;
}

export function getLogger(): Logger {
	if (!logger) {
		logger = new CLILogger();
	}
	return logger;
}
