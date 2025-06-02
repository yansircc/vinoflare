import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import type { BetterAuthContext } from "../lib/types";

const router = new Hono<BetterAuthContext>();

// Better Auth 路由处理器
router.all("/*", (c) => {
	const auth = createAuth(c.env.DB, c.env);
	return auth.handler(c.req.raw);
});

export default router;
