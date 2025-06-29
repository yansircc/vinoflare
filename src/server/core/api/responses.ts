import { z } from "zod/v4";

// Standard error response schema
export const errorResponseSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
		timestamp: z.string(),
		path: z.string(),
	}),
});

// Helper to create error response definitions
export function createErrorResponse(description: string) {
	return {
		description,
		content: {
			"application/json": {
				schema: errorResponseSchema,
			},
		},
	};
}

// Standard error responses
export const standardErrorResponses = {
	400: createErrorResponse(
		"Bad Request - The request was invalid or cannot be served",
	),
	401: createErrorResponse("Unauthorized - Authentication is required"),
	403: createErrorResponse("Forbidden - The request is not allowed"),
	404: createErrorResponse("Not Found - The requested resource was not found"),
	409: createErrorResponse(
		"Conflict - The request conflicts with the current state",
	),
	422: createErrorResponse(
		"Unprocessable Entity - The request was well-formed but contains semantic errors",
	),
	429: createErrorResponse("Too Many Requests - Rate limit exceeded"),
	500: createErrorResponse(
		"Internal Server Error - An unexpected error occurred",
	),
} as const;

// Helper to create success response
export function createSuccessResponse<T extends z.ZodTypeAny>(
	schema: T,
	description = "Success",
) {
	return {
		description,
		content: {
			"application/json": {
				schema,
			},
		},
	};
}

// Commonly used response combinations
export const responses = {
	// Single success response with standard errors
	withErrors: <T extends z.ZodTypeAny>(successSchema: T) => ({
		200: createSuccessResponse(successSchema),
		...standardErrorResponses,
	}),

	// Created response (201) with standard errors
	created: <T extends z.ZodTypeAny>(schema: T) => ({
		201: createSuccessResponse(schema, "Created successfully"),
		...standardErrorResponses,
	}),

	// No content response (204) with standard errors
	noContent: () => ({
		204: {
			description:
				"No Content - The request was successful but there is no content to return",
		},
		...standardErrorResponses,
	}),

	// Paginated response helper
	paginated: <T extends z.ZodTypeAny>(itemSchema: T, itemsKey: string) => ({
		200: createSuccessResponse(
			z.object({
				[itemsKey]: z.array(itemSchema),
				pagination: z.object({
					page: z.number(),
					limit: z.number(),
					total: z.number(),
					totalPages: z.number(),
				}),
			}),
			"Paginated results",
		),
		...standardErrorResponses,
	}),
};

// Response type helpers
export type SuccessResponse<T> = {
	[K in keyof T]: T[K];
};

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
