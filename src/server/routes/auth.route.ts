import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import type { BaseContext } from "../lib/types";

const router = new Hono<BaseContext>();

// Better Auth 路由处理器
router.all("/*", (c) => {
	const url = new URL(c.req.url);
	const auth = createAuth(c.env, url.origin);
	return auth.handler(c.req.raw);
});

export default router;
