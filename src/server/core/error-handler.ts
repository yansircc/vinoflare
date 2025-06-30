import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod/v4";
import { colorize, colorizeJson } from "../utils/colors";

export class APIError extends Error {
	constructor(
		public code: string,
		message: string,
		public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
		public details?: unknown,
	) {
		super(message);
		this.name = "APIError";
	}
}

interface ErrorResponse {
	error: {
		code: string;
		message: string;
		details?: unknown;
		timestamp: string;
		path?: string;
	};
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, c: Context): Response {
	const timestamp = new Date().toISOString();
	const path = c.req.path;
	const method = c.req.method;

	// Handle Hono HTTPException
	if (err instanceof HTTPException) {
		const errorCode = (err as any).cause?.code || getErrorCode(err.status);
		
		const response: ErrorResponse = {
			error: {
				code: errorCode,
				message: err.message,
				timestamp,
				path,
			},
		};

		// Include details in non-production environments
		if (c.env?.ENVIRONMENT !== "production" && (err as any).cause) {
			response.error.details = (err as any).cause;
		}

		// Log the error in JSON format with color
		const prefix = colorize("✖--", "red");
		console.error(`${prefix} ${colorizeJson({
			type: "ERROR",
			timestamp,
			method,
			path,
			status: err.status,
			code: errorCode,
			message: err.message,
			details: (err as any).cause || undefined,
		})}`);

		return c.json(response, err.status);
	}

	// Handle API errors
	if (err instanceof APIError) {
		const response: ErrorResponse = {
			error: {
				code: err.code,
				message: err.message,
				timestamp,
				path,
			},
		};

		// Include details in non-production environments
		if (c.env?.ENVIRONMENT !== "production" && err.details) {
			response.error.details = err.details;
		}

		// Log the error in JSON format with color
		const statusColor = err.statusCode >= 500 ? "red" : "yellow";
		const prefix = colorize("✖--", statusColor as any);
		console.error(`${prefix} ${colorizeJson({
			type: "ERROR",
			timestamp,
			method,
			path,
			status: err.statusCode,
			code: err.code,
			message: err.message,
			details: err.details || undefined,
		})}`);

		return c.json(response, err.statusCode as any);
	}

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		const response: ErrorResponse = {
			error: {
				code: "VALIDATION_ERROR",
				message: "Invalid request data",
				timestamp,
				path,
			},
		};

		if (c.env?.ENVIRONMENT !== "production") {
			response.error.details = err.issues;
		}

		// Log the error in JSON format with details
		const prefix = colorize("✖--", "yellow");
		console.error(`${prefix} ${colorizeJson({
			type: "ERROR",
			timestamp,
			method,
			path,
			status: StatusCodes.BAD_REQUEST,
			code: "VALIDATION_ERROR",
			message: "Invalid request data",
			details: err.issues,
		})}`);

		return c.json(response, StatusCodes.BAD_REQUEST);
	}

	// Handle unknown errors
	const response: ErrorResponse = {
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: "An unexpected error occurred",
			timestamp,
			path,
		},
	};

	// Include stack trace in development
	if (c.env?.ENVIRONMENT === "development") {
		response.error.details = {
			message: err.message,
			stack: err.stack,
		};
	}

	// Log the error in JSON format
	const prefix = colorize("✖--", "red");
	console.error(`${prefix} ${colorizeJson({
		type: "ERROR",
		timestamp,
		method,
		path,
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		code: "INTERNAL_SERVER_ERROR",
		message: err.message || "An unexpected error occurred",
		stack: c.env?.ENVIRONMENT === "development" ? err.stack : undefined,
	})}`);

	return c.json(response, StatusCodes.INTERNAL_SERVER_ERROR);
}

/**
 * Get error code from HTTP status
 */
function getErrorCode(status: number): string {
	switch (status) {
		case StatusCodes.BAD_REQUEST:
			return "BAD_REQUEST";
		case StatusCodes.UNAUTHORIZED:
			return "UNAUTHORIZED";
		case StatusCodes.FORBIDDEN:
			return "FORBIDDEN";
		case StatusCodes.NOT_FOUND:
			return "NOT_FOUND";
		case StatusCodes.CONFLICT:
			return "CONFLICT";
		case StatusCodes.UNPROCESSABLE_ENTITY:
			return "UNPROCESSABLE_ENTITY";
		case StatusCodes.TOO_MANY_REQUESTS:
			return "TOO_MANY_REQUESTS";
		default:
			return "INTERNAL_SERVER_ERROR";
	}
}
