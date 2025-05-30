import { isDev } from "@/lib/env";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createAuth } from "../auth";
import type { AuthSession, AuthUser } from "../db/types";
import type { AuthContext } from "../types/context";

/**
 * 认证中间件 - 使用 Better Auth 的内置会话验证
 * 优化错误处理和性能
 */
export const authMiddleware = createMiddleware<AuthContext>(async (c, next) => {
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
 * 可选认证中间件 - 不强制要求登录，但会设置用户信息
 */
export const optionalAuthMiddleware = createMiddleware<AuthContext>(
	async (c, next) => {
		try {
			const auth = createAuth(c.env.DB, c.env);

			const session = await auth.api.getSession({
				headers: c.req.raw.headers,
			});

			if (session && session.session.expiresAt >= new Date()) {
				c.set("user", session.user as unknown as AuthUser);
				c.set("session", session.session as unknown as AuthSession);
			}

			await next();
		} catch (error) {
			// 可选认证失败时只记录日志，不阻止请求
			console.warn(
				"🔓 可选认证失败:",
				error instanceof Error ? error.message : "Unknown error",
			);
			await next();
		}
	},
);

/**
 * 增强的日志中间件 - 包含更多有用信息
 */
export const loggingMiddleware = createMiddleware(async (c, next) => {
	const start = performance.now();
	const requestId = crypto.randomUUID();

	// 设置请求ID到响应头（用于追踪）
	c.res.headers.set("x-request-id", requestId);

	// 记录请求开始
	if (!isDev) {
		console.log(`🚀 [${requestId}] ${c.req.method} ${c.req.path} - Start`, {
			userAgent: c.req.header("user-agent"),
			ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for"),
			referer: c.req.header("referer"),
		});
	}

	await next();

	const duration = performance.now() - start;
	const status = c.res.status;

	// 根据状态码选择日志级别
	const logLevel = status >= 500 ? "❌" : status >= 400 ? "⚠️" : "✅";

	console.log(
		`${logLevel} [${requestId}] ${c.req.method} ${c.req.path} - ${status} - ${duration.toFixed(2)}ms`,
	);
});

/**
 * 错误处理中间件
 */
export const errorHandlerMiddleware = createMiddleware(async (c, next) => {
	try {
		await next();
	} catch (error) {
		console.error("💥 未处理的错误:", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			path: c.req.path,
			method: c.req.method,
			timestamp: new Date().toISOString(),
		});

		if (error instanceof HTTPException) {
			return error.getResponse();
		}

		return c.json(
			{
				success: false,
				error: "服务器内部错误",
				timestamp: new Date().toISOString(),
			},
			500,
		);
	}
});
