import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { database } from "../middleware/database";
import { authGuard } from "../middleware/auth-guard";
import { trimSlash } from "../middleware/trim-slash";
import { errorHandler } from "./error-handler";
import { registerModules } from "./module-loader";
import { createDocsRoutes } from "../routes/docs";
import type { ModuleDefinition } from "./module-loader";
import type { BaseContext } from "../lib/worker-types";

export interface AppFactoryOptions {
  modules: ModuleDefinition[];
  middleware?: {
    database?: boolean;
    auth?: boolean;
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
    app.use(logger());
  }
  if (options.middleware?.cors) {
    app.use(cors());
  }
  if (options.middleware?.trimSlash) {
    app.use(trimTrailingSlash());
    app.use(trimSlash);
  }
  
  // Apply route-specific middleware
  if (options.basePath && (options.middleware?.database || options.middleware?.auth)) {
    const apiPath = `${options.basePath}/*`;
    if (options.middleware?.database) {
      app.use(apiPath, database());
    }
    if (options.middleware?.auth) {
      app.use(apiPath, authGuard);
    }
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