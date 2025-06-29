import { StatusCodes } from "http-status-codes";
import { APIBuilder } from "@/server/lib/api-builder";
import { authHandler, getCurrentUserHandler } from "./auth.handlers";
import { userResponseSchema } from "./auth.schema";

// Create module routes
export const createAuthModule = () => {
	const builder = new APIBuilder();

	// Get current user - using fluent API
	builder
		.get("/user", getCurrentUserHandler)
		.summary("Get current user")
		.description("Returns the currently authenticated user")
		.tags("Authentication")
		.response(StatusCodes.OK, {
			description: "Current user information",
			schema: userResponseSchema,
		})
		.response(StatusCodes.UNAUTHORIZED, {
			description: "Not authenticated",
		});

	// Better-auth endpoints - handle all HTTP methods
	// 不添加 openapi 定义，因为这是 Better Auth 的内部路由
	builder.get("/*", authHandler);
	builder.post("/*", authHandler);
	builder.put("/*", authHandler);
	builder.delete("/*", authHandler);
	builder.patch("/*", authHandler);

	return builder;
};
