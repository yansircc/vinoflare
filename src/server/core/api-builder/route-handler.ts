import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { RouteDefinition } from "./types";

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
						cause: result.error.flatten(),
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
						cause: result.error.flatten(),
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
						cause: result.error.flatten(),
					});
				}
				input.query = result.data;
			}

			return await definition.handler(c, input);
		} catch (error) {
			// Use custom error handler if provided
			if (errorHandler) {
				return errorHandler(error as Error, c);
			}
			throw error;
		}
	};
}
