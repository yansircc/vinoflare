/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";
import { renderer } from "./client/renderer";

// Lazy-load the app to avoid "matcher already built" error
let mainApp: Hono<{ Bindings: CloudflareBindings }> | null = null;

async function getOrCreateApp() {
	if (mainApp) return mainApp;

	const app = new Hono<{ Bindings: CloudflareBindings }>();

	// Create and mount API app with dynamic module loading
	const modules = await loadModules();

	const apiApp = createApp({
		modules,
		basePath: "",
		middleware: {
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

	mainApp = app;
	return app;
}

// Export a proper fetch handler object
export default {
	async fetch(
		request: Request,
		env: CloudflareBindings,
		ctx: ExecutionContext,
	) {
		const app = await getOrCreateApp();
		return app.fetch(request, env, ctx);
	},
};

// Export app type for RPC client
export type AppType = Hono<{ Bindings: CloudflareBindings }>;
