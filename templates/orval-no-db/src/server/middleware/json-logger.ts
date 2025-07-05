import { logger } from "hono/logger";
import { colorize, colorizeJson, getStatusColor } from "../../utils/colors";
import { stripAnsi } from "../../utils/strip-ansi";

/**
 * Custom JSON logger middleware for consistent logging format
 */
export function jsonLogger() {
	return logger((str) => {
		// Parse the default logger output
		// Format: "<-- GET /" or "--> GET / 200 5ms"
		const isIncoming = str.startsWith("<--");
		const parts = str.replace(/^(-->|<--)\s+/, "").split(" ");

		if (isIncoming) {
			// Incoming request
			const [method, path] = parts;
			const logData = {
				type: "REQUEST",
				timestamp: new Date().toISOString(),
				method,
				path,
			};

			// Add arrow prefix with color
			const prefix = colorize("<--", "blue");
			console.log(`${prefix} ${colorizeJson(logData)}`);
		} else {
			// Outgoing response
			const [method, path, status, duration] = parts;
			// Strip ANSI escape sequences and extract the actual status code
			const cleanStatus = status ? stripAnsi(status) : "";
			const statusCode = parseInt(cleanStatus, 10);

			// Log all responses
			const logData: any = {
				type: "RESPONSE",
				timestamp: new Date().toISOString(),
				method,
				path,
				duration,
			};

			// Only add status if it's a valid number
			if (!Number.isNaN(statusCode)) {
				logData.status = statusCode;
			}

			// Add arrow prefix with color based on status
			const color = getStatusColor(Number.isNaN(statusCode) ? 0 : statusCode);
			const prefix = colorize("-->", color);
			console.log(`${prefix} ${colorizeJson(logData)}`);
		}
	});
}
