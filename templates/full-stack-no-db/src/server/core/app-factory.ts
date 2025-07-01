import { Hono } from "hono";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";
import type { BaseContext } from "../lib/worker-types";
import { jsonLogger } from "../middleware/json-logger";
import { createDocsRoutes } from "../routes/docs";
import { errorHandler } from "./error-handler";
import type { ModuleDefinition } from "./module-loader";
import { registerModules } from "./module-loader";

export interface AppFactoryOptions {
	modules: ModuleDefinition[];
	middleware?: {
		trimSlash?: boolean;
		cors?: boolean;
		logger?: boolean;
	};
	basePath?: string;
	testEnv?: any;
	includeDocs?: boolean;
	includeHealthCheck?: boolean;
}

export function createApp(options: AppFactoryOptions) {
	const app = new Hono<BaseContext>();

	// Apply global middleware based on configuration
	if (options.middleware?.logger) {
		app.use(jsonLogger());
	}
	if (options.middleware?.cors) {
		app.use(cors());
	}
	if (options.middleware?.trimSlash) {
		app.use(trimTrailingSlash());
		// Removed custom trimSlash middleware - trimTrailingSlash handles it properly
	}

	// Register modules
	registerModules(app, options.modules, options.basePath);

	// Optional features
	if (options.includeDocs) {
		const docsApp = createDocsRoutes(options.modules);
		app.route("/", docsApp);
	}

	if (options.includeHealthCheck) {
		app.get("/health", (c) => {
			return c.json({
				status: "ok",
				timestamp: new Date().toISOString(),
				version: "1.0.0",
				modules: options.modules.length,
			});
		});
	}

	// Error handler
	app.onError(errorHandler);

	// Test environment support
	if (options.testEnv) {
		const originalRequest = app.request.bind(app);
		app.request = (input: any, requestInit?: any, env?: any) => {
			return originalRequest(input, requestInit, env || options.testEnv);
		};
	}

	return app;
}
