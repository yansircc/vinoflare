import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import type { MiddlewareHandler } from "hono";
import { z } from "zod/v4";
import { createSuccessResponse, standardErrorResponses } from "./responses.js";

// Types for route definitions
interface RouteDefinition<TPath extends string = string> {
	method: "get" | "post" | "put" | "patch" | "delete";
	path: TPath;
	summary?: string;
	description?: string;
	tags?: string[];
	params?: z.ZodObject<any>;
	query?: z.ZodObject<any>;
	body?: z.ZodTypeAny;
	response?: z.ZodTypeAny | Record<string, z.ZodTypeAny>;
	status?: number;
	middleware?: MiddlewareHandler[];
	handler: RouteHandler<any, any>;
}

// Fluent API builder class
export class APIBuilder {
	private app: OpenAPIHono;
	private commonMiddleware: MiddlewareHandler[] = [];
	private commonTags: string[] = [];

	constructor(_basePath = "") {
		this.app = new OpenAPIHono();
		// basePath can be used for future features like automatic prefixing
	}

	// Set common middleware for all routes
	middleware(...middleware: MiddlewareHandler[]) {
		this.commonMiddleware.push(...middleware);
		return this;
	}

	// Set common tags for all routes
	tags(...tags: string[]) {
		this.commonTags.push(...tags);
		return this;
	}

	// Generic route builder
	private route<TPath extends string>(definition: RouteDefinition<TPath>) {
		const {
			method,
			path,
			summary,
			description,
			tags = [],
			params,
			query,
			body,
			response,
			status = method === "post" ? 201 : 200,
			middleware = [],
			handler,
		} = definition;

		// Build request config
		const request: any = {};
		if (params) request.params = params;
		if (query) request.query = query;
		if (body) {
			request.body = {
				content: {
					"application/json": {
						schema: body,
					},
				},
			};
		}

		// Build responses config
		const responses: any = { ...standardErrorResponses };

		if (response) {
			if (response instanceof z.ZodType) {
				responses[status] = createSuccessResponse(response);
			} else {
				// Handle multiple responses
				Object.entries(response).forEach(([statusCode, schema]) => {
					responses[statusCode] = createSuccessResponse(schema);
				});
			}
		} else if (status === 204) {
			responses[204] = {
				description: "No Content",
			};
		}

		// Create the route
		const route = createRoute({
			method,
			path,
			summary,
			description,
			tags: [...this.commonTags, ...tags],
			request: Object.keys(request).length > 0 ? request : undefined,
			responses,
		} as RouteConfig);

		// Apply middleware and handler
		const allMiddleware = [...this.commonMiddleware, ...middleware];

		// Apply middleware to the specific route path
		if (allMiddleware.length > 0) {
			// Create a full route pattern for middleware
			const fullPath = path === "/" ? "/*" : `${path}/*`;
			allMiddleware.forEach((mw) => {
				this.app.use(fullPath, mw);
			});
		}

		this.app.openapi(route, handler);

		return this;
	}

	// HTTP method shortcuts
	get<TPath extends string>(
		path: TPath,
		config: Omit<RouteDefinition<TPath>, "method" | "path">,
		handler?: RouteHandler<any, any>,
	) {
		return this.route({
			method: "get",
			path,
			...config,
			handler: handler || config.handler,
		});
	}

	post<TPath extends string>(
		path: TPath,
		config: Omit<RouteDefinition<TPath>, "method" | "path">,
		handler?: RouteHandler<any, any>,
	) {
		return this.route({
			method: "post",
			path,
			...config,
			handler: handler || config.handler,
		});
	}

	put<TPath extends string>(
		path: TPath,
		config: Omit<RouteDefinition<TPath>, "method" | "path">,
		handler?: RouteHandler<any, any>,
	) {
		return this.route({
			method: "put",
			path,
			...config,
			handler: handler || config.handler,
		});
	}

	patch<TPath extends string>(
		path: TPath,
		config: Omit<RouteDefinition<TPath>, "method" | "path">,
		handler?: RouteHandler<any, any>,
	) {
		return this.route({
			method: "patch",
			path,
			...config,
			handler: handler || config.handler,
		});
	}

	delete<TPath extends string>(
		path: TPath,
		config: Omit<RouteDefinition<TPath>, "method" | "path">,
		handler?: RouteHandler<any, any>,
	) {
		return this.route({
			method: "delete",
			path,
			...config,
			handler: handler || config.handler,
		});
	}

	// Build and return the Hono app
	build() {
		return this.app;
	}
}

// Factory function for creating API builders
export function createAPI(basePath = "") {
	return new APIBuilder(basePath);
}
