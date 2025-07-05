import { Hono } from "hono";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";

// Create the main app with proper middleware configuration
async function createMainApp() {
	const app = new Hono<{ Bindings: CloudflareBindings }>();

	// Create and mount API app with dynamic module loading
	const modules = await loadModules();

	// Register modules for database middleware
	const { ModuleRegistry } = await import("@/server/db/modular");
	ModuleRegistry.register(modules);

	const apiApp = createApp({
		modules,
		basePath: "",
		middleware: {
			database: true,
			cors: true,
			logger: true,
			trimSlash: true,
		},
		includeDocs: true,
		includeHealthCheck: true,
	});

	app.route("/api", apiApp);

	// Handle root redirect to API docs
	app.get("/", (c) => {
		return c.redirect("/api/docs");
	});

	// 404 handler for non-API routes
	app.all("*", (c) => {
		return c.json({ error: "Not found. This is an API-only server." }, 404);
	});

	return app;
}

// Export for Cloudflare Workers
export default {
	async fetch(
		request: Request,
		env: CloudflareBindings,
		ctx: ExecutionContext,
	) {
		const app = await createMainApp();
		return app.fetch(request, env, ctx);
	},
};
