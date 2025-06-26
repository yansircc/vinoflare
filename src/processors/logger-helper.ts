import type { Logger } from "../types";
import { CLILogger } from "../utils/logger";

/**
 * Create a processor-specific logger
 */
export function createProcessorLogger(
	processorName: string,
	parentLogger: Logger,
): Logger {
	if (parentLogger instanceof CLILogger) {
		return parentLogger.child(processorName);
	}
	// Fallback: return parent logger if it doesn't support child loggers
	return parentLogger;
}

/**
 * Log processor lifecycle events consistently
 */
export class ProcessorLogHelper {
	constructor(private logger: Logger) {}

	/**
	 * Log processor start
	 */
	start(processorName: string, message?: string): void {
		this.logger.info(
			message || `Starting ${processorName}...`
		);
	}

	/**
	 * Log processor completion
	 */
	complete(processorName: string, message?: string): void {
		this.logger.success(
			message || `${processorName} completed`
		);
	}

	/**
	 * Log processor skip
	 */
	skip(processorName: string, reason?: string): void {
		this.logger.debug(
			`Skipping ${processorName}${reason ? `: ${reason}` : ""}`
		);
	}

	/**
	 * Log processor error
	 */
	error(processorName: string, error: any): void {
		this.logger.error(
			`${processorName} failed: ${error.message || error}`
		);
	}
}