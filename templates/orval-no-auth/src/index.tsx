/** @jsxImportSource hono/jsx */

import type { Hono } from "hono";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";
import { renderer } from "./client/renderer";

// Export an object with the fetch handler to avoid "matcher already built" error
export default {
	async fetch(
		request: Request,
		env: CloudflareBindings,
		ctx: ExecutionContext,
	) {
		// Lazy load the app creation to avoid module initialization issues
		const { Hono } = await import("hono");
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

		return app.fetch(request, env, ctx);
	},
};

// Export app type for RPC client
export type AppType = Hono<{ Bindings: CloudflareBindings }>;
