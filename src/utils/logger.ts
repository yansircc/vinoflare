import kleur from "kleur";
import type { Logger } from "../types";

/**
 * Simple logger implementation using kleur for colored output
 */
export class CLILogger implements Logger {
	private debugMode: boolean;

	constructor(debugMode = false) {
		this.debugMode = debugMode;
	}

	info(message: string): void {
		console.log(message);
	}

	warn(message: string): void {
		console.log(kleur.yellow(`⚠️  ${message}`));
	}

	error(message: string): void {
		console.error(kleur.red(`✖ ${message}`));
	}

	success(message: string): void {
		console.log(kleur.green(`✓ ${message}`));
	}

	debug(message: string): void {
		if (this.debugMode) {
			console.log(kleur.gray(`[DEBUG] ${message}`));
		}
	}
}

// Singleton instance
let logger: Logger | null = null;

export function createLogger(debugMode = false): Logger {
	if (!logger) {
		logger = new CLILogger(debugMode);
	}
	return logger;
}

export function getLogger(): Logger {
	if (!logger) {
		logger = new CLILogger();
	}
	return logger;
}
