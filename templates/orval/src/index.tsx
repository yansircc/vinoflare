/** @jsxImportSource hono/jsx */

import { Hono } from "hono";

// Lazy load dependencies to avoid "matcher already built" error
let app: Hono<{ Bindings: CloudflareBindings }> | null = null;

async function initializeApp() {
	if (app) return app;

	const [{ createApp }, { loadModules }, { renderer }, { ModuleRegistry }] =
		await Promise.all([
			import("@/server/core/app-factory"),
			import("@/server/core/module-loader"),
			import("./client/renderer"),
			import("@/server/db/modular"),
		]);

	app = new Hono<{ Bindings: CloudflareBindings }>();

	// Load modules
	const modules = await loadModules();

	// Register modules for database middleware
	ModuleRegistry.register(modules);

	// Create and mount API app with dynamic module loading
	const apiApp = createApp({
		modules,
		basePath: "",
		middleware: {
			database: true,
			auth: true,
			cors: true,
			logger: true,
			trimSlash: true,
		},
		includeDocs: true,
		includeHealthCheck: true,
	});

	app.route("/api", apiApp);

	// Frontend routes (React SPA) - must be after API routes
	// Only use renderer for non-API routes
	app.use("*", async (c, next) => {
		// Skip renderer for API routes
		if (c.req.path.startsWith("/api/")) {
			return next();
		}
		const html = await renderer(c);
		return c.html(html);
	});

	return app;
}

// Export a proper fetch handler
export default {
	async fetch(
		request: Request,
		env: CloudflareBindings,
		ctx: ExecutionContext,
	) {
		const app = await initializeApp();
		return app.fetch(request, env, ctx);
	},
};

// Export app type for RPC client
export type AppType = Hono<{ Bindings: CloudflareBindings }>;
