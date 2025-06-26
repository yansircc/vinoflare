import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { API_CONFIG } from "../config/api";
import type { ModuleDefinition } from "../core/module-loader";
import { createOpenAPIHandler } from "../core/openapi-generator";

type ScalarTheme =
	| "default"
	| "none"
	| "kepler"
	| "alternate"
	| "moon"
	| "purple"
	| "solarized"
	| "bluePlanet"
	| "deepSpace"
	| "saturn"
	| "elysiajs"
	| "fastify"
	| "mars"
	| "laserwave";
type ScalarTargetKey =
	| "js"
	| "c"
	| "r"
	| "go"
	| "clojure"
	| "csharp"
	| "http"
	| "java"
	| "kotlin"
	| "node"
	| "objc"
	| "ocaml"
	| "php"
	| "powershell"
	| "python"
	| "ruby"
	| "shell"
	| "swift"
	| "dart";

export interface DocsConfig {
	theme?: ScalarTheme;
	layout?: "modern" | "classic";
	defaultHttpClient?: {
		targetKey: ScalarTargetKey;
		clientKey: string;
	};
}

const DEFAULT_DOCS_CONFIG: DocsConfig = {
	theme: "kepler",
	layout: "modern",
	defaultHttpClient: {
		targetKey: "js",
		clientKey: "fetch",
	},
};

/**
 * Create documentation routes
 */
export function createDocsRoutes(
	modules: ModuleDefinition[],
	config: DocsConfig = {},
) {
	const app = new Hono();
	const docsConfig = { ...DEFAULT_DOCS_CONFIG, ...config };

	// Use API config for OpenAPI spec
	// Import at the top level instead of using require

	// OpenAPI JSON endpoint
	app.get("/openapi.json", createOpenAPIHandler(modules, API_CONFIG.openapi));

	// Scalar API Reference UI
	app.get(
		"/docs",
		Scalar({
			url: "/api/openapi.json",
			...docsConfig,
		} as any),
	);

	// Redirect root to docs
	app.get("/", (c) => {
		return c.redirect("/api/docs");
	});

	return app;
}
