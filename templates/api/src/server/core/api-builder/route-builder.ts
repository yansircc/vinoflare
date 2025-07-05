import { z } from "zod/v4";
import type {
	HTTPMethod,
	OpenAPIRouteConfig,
	RouteDefinition,
	RouteHandler,
} from "./types";

export class RouteBuilder<TBody = any, TParams = any, TQuery = any> {
	private definition: RouteDefinition<TBody, TParams, TQuery>;

	constructor(
		_builder: any, // Avoid circular dependency
		method: HTTPMethod,
		path: string,
		handler: RouteHandler<TBody, TParams, TQuery>,
	) {
		this.definition = {
			method,
			path,
			handler,
			validation: {},
			responses: [],
		};
	}

	input<T>(
		schema: z.ZodType<T>,
		type: "body" | "params" | "query",
	): RouteBuilder<any, any, any> {
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

	// More intuitive API methods
	body<T>(schema: z.ZodType<T>): RouteBuilder<T, TParams, TQuery> {
		this.definition.validation!.body = schema;
		return this as any;
	}

	params<T extends Record<string, z.ZodType<any>>>(
		schema: T | z.ZodObject<T>,
	): RouteBuilder<TBody, any, TQuery> {
		// If it's already a ZodType, use it directly
		if (schema && typeof schema === "object" && "parse" in schema) {
			this.definition.validation!.params = schema as z.ZodType<any>;
		} else {
			// Otherwise, wrap the schema definition in z.object()
			this.definition.validation!.params = z.object(schema as T);
		}
		return this as any;
	}

	query<T extends Record<string, z.ZodType<any>>>(
		schema: T | z.ZodObject<T>,
	): RouteBuilder<TBody, TParams, any> {
		// If it's already a ZodType, use it directly
		if (schema && typeof schema === "object" && "parse" in schema) {
			this.definition.validation!.query = schema as z.ZodType<any>;
		} else {
			// Otherwise, wrap the schema definition in z.object()
			this.definition.validation!.query = z.object(schema as T);
		}
		return this as any;
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

	response(
		statusCode: number,
		options: { description: string; schema?: z.ZodType<any> },
	): this {
		if (!this.definition.responses) {
			this.definition.responses = [];
		}
		this.definition.responses.push({
			statusCode,
			description: options.description,
			schema: options.schema,
		});
		return this;
	}

	summary(summary: string): this {
		if (!this.definition.openapi) {
			this.definition.openapi = {};
		}
		this.definition.openapi.summary = summary;
		return this;
	}

	description(description: string): this {
		if (!this.definition.openapi) {
			this.definition.openapi = {};
		}
		this.definition.openapi.description = description;
		return this;
	}

	tags(...tags: string[]): this {
		if (!this.definition.openapi) {
			this.definition.openapi = {};
		}
		this.definition.openapi.tags = tags;
		return this;
	}

	security(security: Array<Record<string, string[]>>): this {
		if (!this.definition.openapi) {
			this.definition.openapi = {};
		}
		this.definition.openapi.security = security;
		return this;
	}

	getDefinition(): RouteDefinition<TBody, TParams, TQuery> {
		return this.definition;
	}
}
