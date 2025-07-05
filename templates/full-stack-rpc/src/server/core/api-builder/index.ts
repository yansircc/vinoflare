import { Hono } from "hono";
import { OpenAPIGenerator } from "./openapi-generator";
import { RouteBuilder } from "./route-builder";
import { createHandler } from "./route-handler";
import type {
	APIBuilderOptions,
	HTTPMethod,
	OpenAPIConfig,
	RouteDefinition,
	RouteHandler as RouteHandlerType,
} from "./types";

export { RouteBuilder } from "./route-builder";
export type { HandlerResult } from "./route-handler";
export * from "./types";

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
		handler: RouteHandlerType<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("get", path, handler);
	}

	post<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandlerType<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("post", path, handler);
	}

	put<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandlerType<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("put", path, handler);
	}

	delete<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandlerType<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("delete", path, handler);
	}

	patch<TBody = any, TParams = any, TQuery = any>(
		path: string,
		handler: RouteHandlerType<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		return this.createRoute("patch", path, handler);
	}

	private createRoute<TBody = any, TParams = any, TQuery = any>(
		method: HTTPMethod,
		path: string,
		handler: RouteHandlerType<TBody, TParams, TQuery>,
	): RouteBuilder<TBody, TParams, TQuery> {
		const routeBuilder = new RouteBuilder<TBody, TParams, TQuery>(
			this,
			method,
			path,
			handler,
		);
		this.addRoute(routeBuilder.getDefinition());
		return routeBuilder;
	}

	private addRoute<TBody = any, TParams = any, TQuery = any>(
		definition: RouteDefinition<TBody, TParams, TQuery>,
	) {
		this.routes.push(definition);

		const handler = createHandler(definition, this.options.errorHandler);

		(this.app as any)[definition.method](definition.path, handler);
	}

	getApp() {
		return this.app;
	}

	/**
	 * Build and return the Hono app for use with RPC
	 * This allows the same routes to be used with hono/client
	 */
	build() {
		return this.app;
	}

	// Generate OpenAPI documentation
	generateOpenAPISpec(config: OpenAPIConfig): any {
		const generator = new OpenAPIGenerator(this.routes);
		return generator.generate(config);
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
