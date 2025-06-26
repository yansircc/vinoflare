import { APIBuilder } from "@/server/lib/api-builder";
import { authHandler, getCurrentUserHandler } from "./auth.handlers";
import { getCurrentUserOpenAPI } from "./auth.openapi";

// Create module routes
export const createAuthModule = () => {
	const builder = new APIBuilder();

	// Get current user - 必须在通配符路由之前定义
	builder.addRoute({
		method: "get",
		path: "/user",
		handler: getCurrentUserHandler,
		openapi: getCurrentUserOpenAPI,
	});

	// Better-auth endpoints - handle all HTTP methods
	// 不添加 openapi 定义，因为这是 Better Auth 的内部路由
	const methods = ["get", "post", "put", "delete", "patch"] as const;
	for (const method of methods) {
		builder.addRoute({
			method,
			path: "/*",
			handler: authHandler,
			// 不添加 openapi，这是内部路由
		});
	}

	return builder;
};
