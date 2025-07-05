import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import type { RouteDefinition } from "./types";

// HandlerResult type from handlers
export interface HandlerResult<T = any> {
	data: T;
	status?: StatusCodes;
}

// Type guard to check if the result is a HandlerResult
function isHandlerResult(result: any): result is HandlerResult {
	return result && typeof result === "object" && "data" in result;
}

export function createHandler<TBody, TParams, TQuery>(
	definition: RouteDefinition<TBody, TParams, TQuery>,
	errorHandler?: (error: Error, c: Context) => Response,
) {
	return async (c: Context) => {
		try {
			const input: { body?: TBody; params?: TParams; query?: TQuery } = {};

			// Validate and parse body
			if (definition.validation?.body) {
				let body: unknown;
				try {
					body = await c.req.json();
				} catch (_e) {
					throw new HTTPException(400, {
						message: "Invalid request body",
						cause: {
							code: "INVALID_REQUEST_BODY",
							details: "Failed to parse JSON",
						},
					});
				}
				const result = definition.validation.body.safeParse(body);
				if (!result.success) {
					throw new HTTPException(400, {
						message: "Validation failed",
						cause: {
							code: "BAD_REQUEST",
							issues: result.error.issues,
						},
					});
				}
				input.body = result.data;
			}

			// Validate and parse params
			if (definition.validation?.params) {
				const params = c.req.param();
				const result = definition.validation.params.safeParse(params);
				if (!result.success) {
					throw new HTTPException(400, {
						message: "Invalid path parameters",
						cause: {
							code: "BAD_REQUEST",
							issues: result.error.issues,
						},
					});
				}
				input.params = result.data;
			}

			// Validate and parse query
			if (definition.validation?.query) {
				const url = new URL(c.req.url);
				const query = Object.fromEntries(url.searchParams);
				const result = definition.validation.query.safeParse(query);
				if (!result.success) {
					throw new HTTPException(400, {
						message: "Invalid query parameters",
						cause: {
							code: "BAD_REQUEST",
							issues: result.error.issues,
						},
					});
				}
				input.query = result.data;
			}

			// Call the handler
			const result = await definition.handler(c, input);

			// Check if the result is a HandlerResult or a Response
			if (isHandlerResult(result)) {
				// Special case for DELETE - return 204 No Content with no body
				if (result.status === StatusCodes.NO_CONTENT) {
					return new Response(null, { status: StatusCodes.NO_CONTENT });
				}

				// Convert HandlerResult to Response
				return c.json(result.data, (result.status || StatusCodes.OK) as any);
			}

			// If it's already a Response, return it directly
			return result;
		} catch (error) {
			// Use custom error handler if provided
			if (errorHandler) {
				return errorHandler(error as Error, c);
			}
			throw error;
		}
	};
}
