import { createMiddleware } from "hono/factory";
import type { BaseContext } from "@/server/lib/worker-types"; 

export const testingAuthMiddleware = createMiddleware<BaseContext>(async (c, next) => {
  // In testing mode, we can set mock user and session
  const mockUser = c.req.header("X-Test-User");
  const mockSession = c.req.header("X-Test-Session");

  if (mockUser && mockSession) {
    try {
      c.set("user", JSON.parse(mockUser));
      c.set("session", JSON.parse(mockSession));
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  await next();
});