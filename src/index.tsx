/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { STATIC_ROUTES } from "@/server/config/routes";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";
import { renderer } from "./client/renderer";

// Create the main app with proper middleware configuration
async function createMainApp() {
	const app = new Hono<{ Bindings: CloudflareBindings }>();

	// Static asset handling
	for (const route of STATIC_ROUTES) {
		app.get(route, async (c) => {
			const url = new URL(c.req.url);
			return await c.env.ASSETS.fetch(new Request(url));
		});
	}

	// Create and mount API app with dynamic module loading
	const modules = await loadModules();

	// Register modules for database middleware
	const { ModuleRegistry } = await import("@/server/db/modular");
	ModuleRegistry.register(modules);

	const apiApp = createApp({
		modules,
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

	return app;
}

// Export the app promise
const app = createMainApp();
export default app;

// Export app type for RPC client
export type AppType = Awaited<typeof app>;
