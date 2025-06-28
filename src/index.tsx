/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { STATIC_ROUTES } from "@/server/config/routes";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";
import { authGuard } from "@/server/middleware/auth-guard";
import { database } from "@/server/middleware/database";
import { renderer } from "./client/renderer";

// Create the main app with proper middleware configuration
async function createMainApp() {
	const app = new Hono<{ Bindings: CloudflareBindings }>();

	// Global middleware
	app.use(logger());
	app.use(cors());
	app.use(trimTrailingSlash());

	// Static asset handling
	for (const route of STATIC_ROUTES) {
		app.get(route, async (c) => {
			const url = new URL(c.req.url);
			return await c.env.ASSETS.fetch(new Request(url));
		});
	}

	// API middleware - apply to /api/* routes
	app.use("/api/*", database());
	app.use("/api/*", authGuard);

	// Create and mount API app with dynamic module loading
	const modules = await loadModules();
	const apiApp = createApp({
		modules,
		includeDocs: true,
		includeHealthCheck: true,
	});

	app.route("/api", apiApp);

	// Frontend routes (React SPA) - must be after API routes
	app.use(renderer);

	// Handle all frontend routes (React Router will take over)
	app.get("/*", (c) => {
		return c.render(<div id="root" />);
	});

	return app;
}

// Export the app promise
const app = createMainApp();
export default app;

// Export app type for RPC client
export type AppType = Awaited<typeof app>;
