/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { STATIC_ROUTES } from "@/server/config/routes";
import { authGuard } from "@/server/middleware/auth-guard";
import { trimSlash } from "@/server/middleware/trim-slash";
import { createAPIApp } from "@/server/routes/api";
import { renderer } from "./client/renderer";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// 全局中间件
app.use(logger());
app.use(cors());
app.use(trimTrailingSlash());
app.use(trimSlash);

// 静态资源处理
for (const route of STATIC_ROUTES) {
	app.get(route, async (c) => {
		const url = new URL(c.req.url);
		return await c.env.ASSETS.fetch(new Request(url));
	});
}

// API 路由配置
const apiApp = createAPIApp();

// API 认证保护 - 默认保护所有 API 路由，除了 PUBLIC_API_ROUTES 中定义的
app.use("/api/*", authGuard);

// 挂载所有 API 路由
app.route("/api", apiApp);

// 前端路由 (React SPA) - 必须在 API 路由之后
app.use(renderer);

// 处理所有前端路由 (React Router 会接管)
app.get("/*", (c) => {
	return c.render(<div id="root" />);
});

export default app;

// 导出应用类型，用于 RPC 客户端
export type AppType = typeof app;
