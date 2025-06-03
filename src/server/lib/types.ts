import type { AuthSession, AuthUser } from "@/server/db/schema";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

/**
 * 统一的 Hono 上下文类型定义
 *
 * 基础上下文 - 只包含环境变量绑定
 */
export interface BaseContext {
	Bindings: Env;
	Variables: {
		user?: AuthUser;
		session?: AuthSession;
	};
}

export type AppOpenAPI = OpenAPIHono<BaseContext>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	BaseContext
>;
