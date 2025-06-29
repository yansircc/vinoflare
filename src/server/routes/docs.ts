import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";

/**
 * Create documentation routes
 */
export function createDocsRoutes() {
	const app = new Hono();

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
