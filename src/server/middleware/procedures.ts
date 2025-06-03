import { isDev } from "@/lib/env";
import type { AuthSession, AuthUser } from "@/server/db/schema";
import { createAuth } from "@/server/lib/auth";
import type { BaseContext } from "@/server/lib/types";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

/**
 * 认证中间件 - 使用 Better Auth 的内置会话验证
 * 优化错误处理和性能
 */
export const authMiddleware = createMiddleware<BaseContext>(async (c, next) => {
	try {
		const auth = createAuth(c.env.DB, c.env);

		// 使用 Better Auth 的内置会话验证
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session) {
			throw new HTTPException(401, {
				message: "未授权：需要登录",
				cause: "NO_SESSION",
			});
		}

		// 验证会话是否过期
		if (session.session.expiresAt < new Date()) {
			throw new HTTPException(401, {
				message: "会话已过期，请重新登录",
				cause: "SESSION_EXPIRED",
			});
		}

		// 设置用户和会话信息到上下文
		c.set("user", session.user as unknown as AuthUser);
		c.set("session", session.session as unknown as AuthSession);

		await next();
	} catch (error) {
		// 详细的错误日志记录
		if (!isDev) {
			console.error("🔐 认证中间件错误:", {
				error: error instanceof Error ? error.message : "Unknown error",
				path: c.req.path,
				method: c.req.method,
				userAgent: c.req.header("user-agent"),
				ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for"),
				timestamp: new Date().toISOString(),
			});
		}

		// 如果已经是HTTPException，直接抛出
		if (error instanceof HTTPException) {
			throw error;
		}

		// 其他错误统一处理
		throw new HTTPException(401, {
			message: "认证失败",
			cause: "AUTH_ERROR",
		});
	}
});

/**
 * 动态配置 OpenAPI 文档的中间件
 */
export const dynamicOpenAPIMiddleware = createMiddleware<BaseContext>(
	async (c, next) => {
		await next();

		// 仅处理 /doc 路径的 JSON 响应
		if (
			c.req.path === "/doc" &&
			c.res.headers.get("content-type")?.includes("application/json")
		) {
			try {
				// 克隆响应以避免消费原始 body stream
				const clonedResponse = c.res.clone();
				const spec = (await clonedResponse.json()) as Record<string, unknown>;

				// 更新服务器配置
				spec.servers = [
					{
						url: c.env.APP_URL,
						description:
							c.env.NODE_ENV === "production" ? "生产环境" : "本地开发环境",
					},
				];

				// 创建新的响应
				c.res = new Response(JSON.stringify(spec), {
					status: c.res.status,
					statusText: c.res.statusText,
					headers: {
						"content-type": "application/json; charset=utf-8",
					},
				});
			} catch (error) {
				// 如果解析失败，保持原响应
				console.warn("Failed to parse OpenAPI spec:", error);
			}
		}
	},
);
