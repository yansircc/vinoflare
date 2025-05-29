/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { logger } from "hono/logger";
import { renderer } from "./renderer";
import { api } from "./server/api";
import type { ApiType } from "./server/api";
import type { BaseContext } from "./server/types/context";

// 创建主应用
const app = new Hono<BaseContext>();

// 全局中间件
app.use("*", logger());
app.use(renderer);

// 挂载 API 路由
const routes = app.route("/", api);

// 处理静态资源
app.get("*", async (c) => {
	return c.render(<div id="root">{/* React 应用将在此处挂载 */}</div>);
});

// 为客户端导出类型
export type AppType = typeof routes;
export type { ApiType };

export default app;
