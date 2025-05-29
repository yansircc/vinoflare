import { Hono } from "hono";
import { createAuth } from "../auth";
import type { BetterAuthContext } from "../types/context";

const app = new Hono<BetterAuthContext>();

// Better Auth 路由处理器
app.all("/*", (c) => {
	const auth = createAuth(c.env.DB, c.env);
	return auth.handler(c.req.raw);
});

export default app;
