/** @jsxImportSource hono/jsx */
import configureOpenAPI from "@/server/lib/configure-open-api";
import createApp from "@/server/lib/create-app";
import authMiddleware from "@/server/middleware/auth";
import authRouter from "@/server/routes/auth.route";
import indexRoute from "@/server/routes/index.route";
import tasksRoute from "@/server/routes/tasks/tasks.index";

// 创建主应用
const app = createApp();

// API 路由继续使用 Hono
configureOpenAPI(app);

// 认证专用路由
app.route("/api/auth", authRouter);

// 需要认证的路由
app.use("/api/tasks/*", authMiddleware);
app.use("/api/me", authMiddleware);

// 链式路由注册以保持类型推断
const routes = app.route("/api", indexRoute).route("/api", tasksRoute);

// 处理静态资源
app.get("/*", async (c) => {
	return c.render(<div id="root">{/* React 应用将在此处挂载 */}</div>);
});

// 为客户端导出类型
export type AppType = typeof routes;

// 导出 Worker 处理器
export default app;
