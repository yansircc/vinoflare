import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import type { ModuleDefinition } from "../core/module-loader";
import { createOpenAPIHandler } from "../core/openapi-generator";

/**
 * Create documentation routes with inline configuration
 */
export function createDocsRoutes(modules: ModuleDefinition[]) {
	const app = new Hono();

	// OpenAPI specification configuration
	const openAPIConfig = {
		title: "Vinoflare API",
		version: "1.0.0",
		description: "REST API for Vinoflare application",
		contact: {
			name: "API Support",
			email: "support@vinoflare.com",
		},
		servers: [
			{
				url: "/api",
				description: "API Server",
			},
		],
	};

	// OpenAPI JSON endpoint
	app.get("/openapi.json", createOpenAPIHandler(modules, openAPIConfig));

	// Scalar API Reference UI with inline configuration
	app.get(
		"/docs",
		Scalar({
			url: "/api/openapi.json",
			theme: "kepler",
			layout: "modern",
			defaultHttpClient: {
				targetKey: "js",
				clientKey: "fetch",
			},
		} as any),
	);

	// Redirect root to docs
	app.get("/", (c) => {
		return c.redirect("/api/docs");
	});

	return app;
}
