import { Hono } from "hono";
import { API_CONFIG } from "../config/api";
import { errorHandler } from "../core/error-handler";
import { registerModules } from "../core/module-loader";
import type { BaseContext } from "../lib/worker-types";
import authModule from "../modules/auth/index";
import helloModule from "../modules/hello/index";
import postsModule from "../modules/posts/index";
import { createDocsRoutes } from "./docs";

// Create API app with new architecture
export const createAPIApp = () => {
	const app = new Hono<BaseContext>();

	// Module registry (will be replaced with dynamic loading in the future)
	const modules = [helloModule, postsModule, authModule];

	// Register all modules
	registerModules(app, modules);

	// Global error handler
	app.onError(errorHandler);

	// Mount documentation routes with configuration
	const docsApp = createDocsRoutes(modules, API_CONFIG.docs);
	app.route("/", docsApp);

	// Health check endpoint
	app.get("/health", (c) => {
		return c.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			version: API_CONFIG.version,
			modules: modules.length,
		});
	});

	return app;
};
