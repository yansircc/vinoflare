import { Hono } from "hono";
import { hc } from "hono/client";
import { galleryRouter } from "../routers/gallery";
import { kitchenRouter } from "../routers/kitchen";
import { postsRouter } from "../routers/posts";
import { todosRouter } from "../routers/todos";
import type { BaseContext } from "../types/context";
import authRouter from "./auth";
import { baseRouter } from "./base";

// 按照 Hono RPC 模式创建主 API 应用
const app = new Hono<BaseContext>()
	.route("/", baseRouter)
	.route("/api/auth", authRouter)

	// 业务路由器
	.route("/api", todosRouter)
	.route("/api", postsRouter)
	.route("/api", kitchenRouter)
	.route("/api", galleryRouter)

	// 404 处理
	.notFound((c) => {
		return c.json(
			{
				success: false,
				error: "端点未找到",
				message: `路径 ${c.req.path} 不存在`,
				method: c.req.method,
				path: c.req.path,
				timestamp: new Date().toISOString(),
				requestId: c.get("requestId"),
			},
			404,
		);
	});

// 导出 API 及其类型以供 RPC 使用
export const api = app;
export type ApiType = typeof app;
export const client = hc<ApiType>("/").api;
