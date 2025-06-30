import { toJSONSchema } from "zod/v4";
import type { OpenAPIConfig, RouteDefinition } from "./types";

export class OpenAPIGenerator {
	constructor(private routes: RouteDefinition[]) {}

	generate(config: OpenAPIConfig): any {
		const paths: Record<string, any> = {};

		// Group routes by path
		for (const route of this.routes) {
			if (!route.openapi) continue;

			// Convert Hono's :param format to OpenAPI {param} format
			const path = route.path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{$1}");
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
					required: p.required !== false,
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

			// Add responses from route definition first
			if (route.responses && route.responses.length > 0) {
				for (const response of route.responses) {
					operation.responses[response.statusCode.toString()] = {
						description: response.description,
					};

					if (response.schema) {
						operation.responses[response.statusCode.toString()].content = {
							"application/json": {
								schema: this.convertSchema(response.schema),
							},
						};
					}
				}
			}

			// Add any additional responses from openapi config that aren't already defined
			if (route.openapi.responses) {
				for (const [status, response] of Object.entries(
					route.openapi.responses,
				)) {
					if (!operation.responses[status]) {
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
				const jsonSchema = toJSONSchema(schema);
				// Clean up the schema for OpenAPI 3.0 compatibility
				return this.cleanupSchema(jsonSchema);
			} catch {
				return { type: "object" };
			}
		}
		return schema;
	}

	private cleanupSchema(schema: any): any {
		if (!schema || typeof schema !== "object") {
			return schema;
		}

		// Create a new object to avoid mutating the original
		const cleaned: any = {};

		for (const [key, value] of Object.entries(schema)) {
			// Remove $schema property (not allowed in OpenAPI)
			if (key === "$schema") {
				continue;
			}

			// Fix exclusiveMinimum/exclusiveMaximum for OpenAPI 3.0
			if (key === "exclusiveMinimum" && typeof value === "number") {
				cleaned.minimum = value;
				cleaned.exclusiveMinimum = true;
				continue;
			}
			if (key === "exclusiveMaximum" && typeof value === "number") {
				cleaned.maximum = value;
				cleaned.exclusiveMaximum = true;
				continue;
			}

			// Remove additionalProperties if false (can cause issues with some tools)
			if (key === "additionalProperties" && value === false) {
				continue;
			}

			// Recursively clean nested schemas
			if (key === "properties" && typeof value === "object" && value !== null) {
				cleaned[key] = {};
				for (const [propKey, propValue] of Object.entries(value)) {
					cleaned[key][propKey] = this.cleanupSchema(propValue);
				}
			} else if (key === "items") {
				cleaned[key] = this.cleanupSchema(value);
			} else if (key === "oneOf" || key === "anyOf" || key === "allOf") {
				cleaned[key] = (value as any[]).map((v) => this.cleanupSchema(v));
			} else {
				cleaned[key] = value;
			}
		}

		return cleaned;
	}
}
