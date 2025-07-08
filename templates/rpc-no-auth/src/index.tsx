/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";
import { renderer } from "./client/renderer";

// Lazy app initialization to avoid "matcher already built" error
let appInstance: Hono<{ Bindings: CloudflareBindings }> | null = null;

async function getApp() {
	if (!appInstance) {
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

		// Frontend routes (React SPA) - must be after API routes
		// Only use renderer for non-API routes
		app.use("*", async (c, next) => {
			// Skip renderer for API routes
			if (c.req.path.startsWith("/api/")) {
				return next();
			}
			return renderer(c, next);
		});

		// Handle all frontend routes (React Router will take over)
		// Exclude API routes explicitly
		app.get("*", (c) => {
			// This should only handle non-API routes
			if (c.req.path.startsWith("/api/")) {
				return c.notFound();
			}
			return c.render(<div id="root" />);
		});

		appInstance = app;
	}

	return appInstance;
}

// Export proper fetch handler object
export default {
	async fetch(
		request: Request,
		env: CloudflareBindings,
		ctx: ExecutionContext,
	) {
		const app = await getApp();
		return app.fetch(request, env, ctx);
	},
};

// Export app type for RPC client
export type AppType = Hono<{ Bindings: CloudflareBindings }>;
