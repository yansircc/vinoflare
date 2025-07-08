/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";
import { renderer } from "./client/renderer";

// Load modules at build time
const modulesPromise = loadModules();

// Create the main Hono app with all routes setup immediately
const app = new Hono<{ Bindings: CloudflareBindings }>();

// Setup promise that resolves when app is ready
const setupPromise = (async () => {
	const modules = await modulesPromise;

	// Register modules for database middleware
	const { ModuleRegistry } = await import("@/server/db/modular");
	ModuleRegistry.register(modules);

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
	// With the new configuration, static assets are served automatically
	// We only need to handle the SPA fallback for client-side routing
	app.get("*", async (c) => {
		// Render the HTML shell with root element for React
		return c.html(await renderer(c));
	});
})();

// Custom fetch handler that waits for setup
export default {
	async fetch(request: Request, env: CloudflareBindings, ctx: ExecutionContext) {
		await setupPromise;
		return app.fetch(request, env, ctx);
	},
};

// Export app type for RPC client
export type AppType = typeof app;
