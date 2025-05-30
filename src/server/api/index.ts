import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { trimTrailingSlash } from "hono/trailing-slash";
import {
	errorHandlerMiddleware,
	loggingMiddleware,
} from "../middleware/procedures";
import { kitchenRouter } from "../routers/kitchen";
import { postsRouter } from "../routers/posts";
import { quotesRouter } from "../routers/quotes";
import type { BaseContext } from "../types/context";
import authRouter from "./auth";

// 按照 Hono RPC 模式创建主 API 应用
const app = new Hono<BaseContext>()
	// 全局中间件 - 按顺序应用
	// 错误处理（最先应用）
	.use("*", errorHandlerMiddleware)

	// 格式化响应
	.use("*", prettyJSON())

	// 请求超时（30秒）
	.use("*", timeout(30000))

	// 请求ID生成（用于日志追踪）
	.use("*", requestId())

	// 请求体大小限制（10MB）
	.use(
		"*",
		bodyLimit({
			maxSize: 10 * 1024 * 1024, // 10MB
			onError: (c) => {
				return c.json(
					{
						success: false,
						error: "请求体过大，最大允许 10MB",
						timestamp: new Date().toISOString(),
					},
					413,
				);
			},
		}),
	)

	// ETag 缓存优化（仅对成功响应启用）
	.use("*", async (c, next) => {
		await next();
		// 只对 2xx 状态码启用 ETag
		if (c.res.status >= 200 && c.res.status < 300) {
			return etag()(c, async () => {});
		}
	})

	// 安全头
	.use(
		"*",
		secureHeaders({
			xContentTypeOptions: "nosniff",
			xFrameOptions: "DENY",
			xXssProtection: "1; mode=block",
			referrerPolicy: "strict-origin-when-cross-origin",
		}),
	)

	// 移除尾随斜杠
	.use("*", trimTrailingSlash())

	// 日志记录
	.use("*", loggingMiddleware)

	// API 路由的 CORS 配置
	.use(
		"/api/*",
		cors({
			origin: (origin, c) => {
				// 在开发环境允许所有源，生产环境限制
				const nodeEnv = (c.env as any)?.NODE_ENV;
				if (nodeEnv === "development") {
					return origin || "*";
				}

				// 生产环境的允许列表
				const allowedOrigins = [
					"https://vinoflare.yansir.workers.dev",
					// 添加你的生产域名
				];

				return allowedOrigins.includes(origin || "") ? origin : null;
			},
			credentials: true,
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: [
				"Content-Type",
				"Authorization",
				"X-Requested-With",
				"Accept",
				"Origin",
			],
			exposeHeaders: ["x-request-id"],
			maxAge: 86400, // 24 hours
		}),
	)

	// 健康检查端点
	.get("/health", (c) => {
		return c.json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			version: "1.0.0",
			environment: (c.env as any)?.NODE_ENV || "unknown",
			requestId: c.get("requestId"),
		});
	})

	// API 信息端点
	.get("/api", (c) => {
		return c.json({
			name: "VinoFlare API",
			version: "1.0.0",
			description: "Hono + Cloudflare Workers + Better Auth",
			endpoints: {
				auth: "/api/auth/*",
				posts: "/api/posts",
				quotes: "/api/quotes",
				health: "/health",
			},
			timestamp: new Date().toISOString(),
		});
	})

	// 认证路由
	.route("/api/auth", authRouter)

	// 业务路由器
	.route("/api", quotesRouter)
	.route("/api", postsRouter)
	.route("/api", kitchenRouter)

	// 404 处理 - 正确的方式
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
