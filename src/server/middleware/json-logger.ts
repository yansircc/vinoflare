import { logger } from "hono/logger";

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
			console.log(
				JSON.stringify({
					type: "REQUEST",
					timestamp: new Date().toISOString(),
					method,
					path,
				})
			);
		} else {
			// Outgoing response
			const [method, path, status, duration] = parts;
			const statusCode = parseInt(status, 10);
			
			// Only log non-error responses (errors are handled by error handler)
			if (statusCode < 400) {
				console.log(
					JSON.stringify({
						type: "RESPONSE",
						timestamp: new Date().toISOString(),
						method,
						path,
						status: statusCode,
						duration,
					})
				);
			}
		}
	});
}