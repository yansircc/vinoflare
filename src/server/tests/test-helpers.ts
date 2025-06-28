import { Hono } from "hono";
import { testingAuthMiddleware } from "@/server/middleware/auth-testing";
import { database } from "@/server/middleware/database";
import { trimTrailingSlash } from "hono/trailing-slash";
import type { ModuleDefinition } from "@/server/core/module-loader";
import { errorHandler } from "@/server/core/error-handler";
import type { BaseContext } from "@/server/lib/worker-types";

export function createTestApp(modules: ModuleDefinition[] = []) {
    const app = new Hono<BaseContext>();

  // Apply global middleware
  app.use(trimTrailingSlash());
  
  // Apply database middleware to API routes
  app.use("/api/*", database());
  
  // Apply testing auth middleware to API routes
  app.use("/api/*", testingAuthMiddleware);

  // Register modules
  for (const module of modules) {
    const moduleInstance = module.createModule();
    // If it's an APIBuilder instance, get the app
    const routes = moduleInstance.getApp ? moduleInstance.getApp() : moduleInstance;
    app.route(`/api${module.basePath}`, routes);
  }

  // Apply error handler
  app.onError(errorHandler);

  return app;
}

export async function createAuthenticatedRequest(
  path: string,
  options: RequestInit = {},
  user = createMockUser(),
  session = createMockSession()
) {
  const headers = new Headers(options.headers);
  headers.set("X-Test-User", JSON.stringify(user));
  headers.set("X-Test-Session", JSON.stringify(session));
  
  return new Request(`http://localhost${path}`, {
    ...options,
    headers,
  });
}

export function createMockUser() {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    image: null,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createMockSession() {
  return {
    id: "test-session-id",
    userId: "test-user-id",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    token: "test-token",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
  };
}