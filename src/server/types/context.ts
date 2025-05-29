import type { types } from "../db";

/**
 * 统一的 Hono 上下文类型定义
 *
 * 基础上下文 - 只包含环境变量绑定
 */
export interface BaseContext {
	Bindings: Env;
}

/**
 * 认证上下文 - 包含用户和会话信息
 */
export interface AuthContext extends BaseContext {
	Variables: {
		user?: types.AuthUser;
		session?: types.AuthSession;
	};
}

/**
 * Better Auth 特定上下文 - 用于认证端点
 */
export interface BetterAuthContext {
	Bindings: {
		DB: D1Database;
		DISCORD_CLIENT_ID: string;
		DISCORD_CLIENT_SECRET: string;
		BETTER_AUTH_SECRET: string;
		APP_URL: string;
		NODE_ENV: string;
	};
}

/**
 * 类型导出，方便使用
 */
export type {
	BaseContext as Base,
	AuthContext as Auth,
	BetterAuthContext as BetterAuth,
};
