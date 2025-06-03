import createApp from "./server/lib/create-app";
import tasksRouter from "./server/routes/tasks/tasks.index";

// 创建测试应用
const app = createApp();

// 注册路由
app.route("/tasks", tasksRouter);

export default app;
