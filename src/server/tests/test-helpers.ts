import { Hono } from "hono";
import { database } from "@/server/middleware/database";
import { trimTrailingSlash } from "hono/trailing-slash";
import type { ModuleDefinition } from "@/server/core/module-loader";
import { errorHandler } from "@/server/core/error-handler";
import type { BaseContext } from "@/server/lib/worker-types";
import { authGuard } from "@/server/middleware/auth-guard";

export function createTestApp(modules: ModuleDefinition[] = [], testEnv?: any) {
    const app = new Hono<BaseContext>();

  // Apply global middleware
  app.use(trimTrailingSlash());
  
  // Apply database middleware to API routes
  app.use("/api/*", database());
  
  // Apply auth guard middleware to API routes
  app.use("/api/*", authGuard);

  // Register modules
  for (const module of modules) {
    const moduleInstance = module.createModule();
    // If it's an APIBuilder instance, get the app
    const routes = moduleInstance.getApp ? moduleInstance.getApp() : moduleInstance;
    app.route(`/api${module.basePath}`, routes);
  }

  // Apply error handler
  app.onError(errorHandler);

  if (testEnv) {
    const originalRequest = app.request.bind(app);
    app.request = (input: any, requestInit?: any, env?: any) => {
      return originalRequest(input, requestInit, env || testEnv);
    };
  }

  return app;
}

export async function createAuthenticatedRequest(
  path: string,
  options: RequestInit = {}
) {
  return new Request(`http://localhost${path}`, options);
}