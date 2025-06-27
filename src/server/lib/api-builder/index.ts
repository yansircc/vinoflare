import type { Context } from "hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import type {
	APIBuilderOptions,
	OpenAPIConfig,
	RouteDefinition,
} from "./types";

export class APIBuilder {
	private app: Hono;
	private routes: RouteDefinition[] = [];
	private options: APIBuilderOptions;

	constructor(options: APIBuilderOptions = {}) {
		this.app = new Hono();
		this.options = options;
		options.middleware?.forEach((m) => this.app.use("*", m));
	}

	addRoute<TInput>(definition: RouteDefinition<TInput>) {
		this.routes.push(definition);

		const middlewares: any[] = [];
		const handler = async (c: Context) => {
			try {
				let input: TInput | undefined;
				if (definition.validation?.body) {
					const body = await c.req.json();
					const result = definition.validation.body.safeParse(body);
					if (!result.success) {
						throw new HTTPException(400, {
							message: "Validation failed",
							cause: result.error.flatten(),
						});
					}
					input = result.data;
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

		(this.app as any)[definition.method](
			definition.path,
			...middlewares,
			handler,
		);

		return this;
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
