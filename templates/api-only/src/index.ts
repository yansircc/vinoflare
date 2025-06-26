import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authGuard } from "@/server/middleware/auth-guard";
import { createAPIApp } from "@/server/routes/api";

interface Env {
	Bindings: CloudflareBindings;
}

const app = new Hono<Env>();

// Global middleware
app.use(logger());
app.use(cors());

// API routes configuration
const apiApp = createAPIApp();

// API auth protection - protects all API routes except those defined in PUBLIC_API_ROUTES
app.use("/api/*", authGuard);

// Mount all API routes
app.route("/api", apiApp);

// Default route
app.get("/", (c) => {
	return c.json({ message: "Vino API Server", version: "1.0.0" });
});

export default app;

// Export app type for RPC clients
export type AppType = typeof app;
