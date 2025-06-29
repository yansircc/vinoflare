import type { Context } from "hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import type {
	APIBuilderOptions,
	HTTPMethod,
	InputType,
	OpenAPIConfig,
	OpenAPIRouteConfig,
	RouteDefinition,
	RouteHandler,
} from "./types";

export * from "./types";

export class RouteBuilder<TBody = any, TParams = any, TQuery = any> {
	private definition: RouteDefinition<TBody, TParams, TQuery>;

	constructor(
		_builder: APIBuilder,
		method: HTTPMethod,
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	) {
		this.definition = {
			method,
			path,
			handler,
			validation: {},
		};
	}

	input<T>(schema: z.ZodType<T>, type: InputType): RouteBuilder<any, any, any> {
		switch (type) {
			case "body":
				this.definition.validation!.body = schema;
				return this as any;
			case "params":
				this.definition.validation!.params = schema;
				return this as any;
			case "query":
				this.definition.validation!.query = schema;
				return this as any;
		}
	}

	output(schema: z.ZodType<any>, statusCode: number = 200): this {
		if (!this.definition.openapi) {
			this.definition.openapi = {};
		}
		if (!this.definition.openapi.responses) {
			this.definition.openapi.responses = {};
		}
		this.definition.openapi.responses[statusCode.toString()] = {
			description: `${statusCode} response`,
			schema,
		};
		return this;
	}

	openapi(config: OpenAPIRouteConfig): this {
		this.definition.openapi = { ...this.definition.openapi, ...config };
		return this;
	}
}

export class APIBuilder {
	private app: Hono;
	private routes: RouteDefinition[] = [];
	private options: APIBuilderOptions;

	constructor(options: APIBuilderOptions = {}) {
		this.app = new Hono();
		this.options = options;
		options.middleware?.forEach((m) => this.app.use("*", m));
	}

	get<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("get", path, handler);
	}

	post<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("post", path, handler);
	}

	put<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("put", path, handler);
	}

	delete<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("delete", path, handler);
	}

	patch<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("patch", path, handler);
	}

	private createRoute<TBody = any, TParams = any, TQuery = any>(
		method: HTTPMethod,
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		const routeBuilder = new RouteBuilder<TBody, TParams, TQuery>(this, method, path, handler);
		this.addRoute((routeBuilder as any).definition);
		return routeBuilder;
	}

	private addRoute<TBody = any, TParams = any, TQuery = any>(
		definition: RouteDefinition<TBody, TParams, TQuery>,
	) {
		this.routes.push(definition);

		const handler = async (c: Context) => {
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
				if (this.options.errorHandler) {
					return this.options.errorHandler(error as Error, c);
				}
				throw error;
			}
		};

		(this.app as any)[definition.method](definition.path, handler);
	}

	getApp() {
		return this.app;
	}

	// Generate OpenAPI documentation
	generateOpenAPISpec(config: OpenAPIConfig): any {
		const paths: Record<string, any> = {};

		// Group routes by path
		for (const route of this.routes) {
			if (!route.openapi) continue;

			const path = route.path;
			if (!paths[path]) {
				paths[path] = {};
			}

			const operation: any = {
				tags: route.openapi.tags,
				summary: route.openapi.summary,
				description: route.openapi.description,
				deprecated: route.openapi.deprecated,
				security: route.openapi.security,
				responses: {},
			};

			// Add request body if defined
			if (route.openapi.request?.body || route.validation?.body) {
				const schema =
					route.openapi.request?.body?.schema ||
					(route.validation?.body
						? this.convertSchema(route.validation.body)
						: undefined);

				if (schema) {
					operation.requestBody = {
						description:
							route.openapi.request?.body?.description || "Request body",
						required: route.openapi.request?.body?.required !== false,
						content: {
							"application/json": {
								schema,
							},
						},
					};
				}
			}

			const parameters = [
				...(route.openapi.request?.params || []).map((p) => ({
					in: "path",
					name: p.name,
					description: p.description,
					required: p.required !== false,
					schema: p.schema || { type: "string" },
				})),
				...(route.openapi.request?.query || []).map((p) => ({
					in: "query",
					name: p.name,
					description: p.description,
					required: p.required === true,
					schema: p.schema || { type: "string" },
				})),
			];

			// Auto-generate param schemas from validation
			if (route.validation?.params && !route.openapi.request?.params) {
				const paramSchema = this.convertSchema(route.validation.params);
				if (paramSchema?.properties) {
					for (const [name, schema] of Object.entries(paramSchema.properties)) {
						parameters.push({
							in: "path",
							name,
							description: undefined,
							required: paramSchema.required?.includes(name) ?? true,
							schema: schema as any,
						});
					}
				}
			}

			// Auto-generate query schemas from validation
			if (route.validation?.query && !route.openapi.request?.query) {
				const querySchema = this.convertSchema(route.validation.query);
				if (querySchema?.properties) {
					for (const [name, schema] of Object.entries(querySchema.properties)) {
						parameters.push({
							in: "query",
							name,
							description: undefined,
							required: querySchema.required?.includes(name) ?? false,
							schema: schema as any,
						});
					}
				}
			}

			if (parameters.length > 0) {
				operation.parameters = parameters;
			}

			// Add responses
			if (route.openapi.responses) {
				for (const [status, response] of Object.entries(
					route.openapi.responses,
				)) {
					operation.responses[status] = {
						description: response.description,
					};

					if (response.schema) {
						operation.responses[status].content = {
							"application/json": {
								schema: this.convertSchema(response.schema),
							},
						};
					}

					if (response.headers) {
						operation.responses[status].headers = response.headers;
					}
				}
			}

			paths[path][route.method] = operation;
		}

		return {
			openapi: "3.0.0",
			info: {
				title: config.title,
				version: config.version,
				description: config.description,
				contact: config.contact,
				license: config.license,
			},
			servers: config.servers,
			paths,
			externalDocs: config.externalDocs,
		};
	}

	private convertSchema(schema: any): any {
		if (schema?._def) {
			try {
				return z.toJSONSchema(schema);
			} catch {
				return { type: "object" };
			}
		}
		return schema;
	}

	// Mount the OpenAPI spec endpoint
	mountOpenAPI(path: string, config: OpenAPIConfig) {
		this.app.get(path, (c) => {
			const spec = this.generateOpenAPISpec(config);
			return c.json(spec);
		});
		return this;
	}
}