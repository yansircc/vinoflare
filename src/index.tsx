/** @jsxImportSource hono/jsx */
import configureOpenAPI from "@/server/lib/configure-open-api";
import createApp from "@/server/lib/create-app";
import authRouter from "@/server/routes/auth.route";
import indexRoute from "@/server/routes/index.route";
import tasksRoute from "@/server/routes/tasks/tasks.index";

// 创建主应用
const app = createApp();

// API 路由继续使用 Hono
configureOpenAPI(app);

app.route("/api/auth", authRouter);

const routes = [indexRoute, tasksRoute] as const;

routes.forEach((route) => {
	app.route("/api", route);
});

app.get("/env", (c) => {
	const url = new URL(c.req.url);
	const origin = url.origin;
	return c.text(`origin: ${origin}`);
});

// 处理静态资源
app.get("/*", async (c) => {
	return c.render(<div id="root">{/* React 应用将在此处挂载 */}</div>);
});

// 为客户端导出类型
export type AppType = (typeof routes)[number];

// 导出 Worker 处理器
export default app;
