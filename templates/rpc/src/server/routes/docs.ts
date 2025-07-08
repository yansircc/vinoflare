import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import type { APIBuilder } from "../core/api-builder";
import type { ModuleDefinition } from "../core/module-loader";

/**
 * Create documentation routes with inline configuration
 */
export function createDocsRoutes(modules: ModuleDefinition[]) {
	const app = new Hono();

	// OpenAPI specification configuration
	const openAPIConfig = {
		openapi: "3.0.0",
		info: {
			title: "Vinoflare API",
			version: "1.0.0",
			description: "REST API for Vinoflare application",
			contact: {
				name: "API Support",
				email: "support@vinoflare.com",
			},
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		tags: [],
		paths: {},
	};

	// OpenAPI JSON endpoint
	app.get("/openapi.json", (c) => {
		// Get the full URL from the request context
		const url = new URL(c.req.url);
		const baseUrl = `${url.protocol}//${url.host}`;

		// Build dynamic servers array
		const servers = [
			{
				url: `${baseUrl}/api`,
				description: "Current API Server",
			},
		];

		// Add environment-specific servers if needed
		if (url.hostname === "localhost" && url.port !== "5173") {
			// Add default local development server
			servers.push({
				url: "http://localhost:5173/api",
				description: "Default Local Development Server",
			});
		}

		// Collect OpenAPI paths from all modules
		const paths: Record<string, any> = {};
		const tags = new Set<string>();

		for (const module of modules) {
			// Create module instance to get APIBuilder
			const apiBuilder = module.createModule() as APIBuilder;

			// Generate OpenAPI spec for this module
			const moduleSpec = apiBuilder.generateOpenAPISpec({
				title: openAPIConfig.info.title,
				version: openAPIConfig.info.version,
				description: openAPIConfig.info.description,
				servers, // Use dynamic servers
				contact: openAPIConfig.info.contact,
			});

			// Merge paths with basePath prefix
			if (moduleSpec.paths) {
				for (const [path, pathItem] of Object.entries(moduleSpec.paths)) {
					let fullPath = module.basePath + path;
					// Remove trailing slash for non-root paths
					if (fullPath.endsWith("/") && fullPath.length > 1) {
						fullPath = fullPath.slice(0, -1);
					}
					paths[fullPath] = pathItem;
				}
			}

			// Collect tags
			if (module.metadata?.tags) {
				module.metadata.tags.forEach((tag) => tags.add(tag));
			}
		}

		// Build final OpenAPI spec
		const spec = {
			...openAPIConfig,
			servers, // Use dynamic servers instead of static config
			paths,
			tags: Array.from(tags).map((name) => ({ name })),
		};

		return c.json(spec);
	});

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
		}),
	);

	// Redirect root to docs
	app.get("/", (c) => {
		return c.redirect("/api/docs");
	});

	return app;
}
