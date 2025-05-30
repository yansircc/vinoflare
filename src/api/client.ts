import type { ApiType } from "@/server/api";
import { hc } from "hono/client";

// 创建 API 客户端
export function createApiClient(baseUrl?: string) {
	const url =
		baseUrl ||
		(typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:5173");

	return hc<ApiType>(url, {
		init: {
			credentials: "include", // 重要：包含 cookies 以支持 Better Auth 会话
			headers: {
				"Content-Type": "application/json",
			},
		},
	});
}

// 默认客户端实例 - 现在正确访问 /api 路径
export const client = createApiClient().api;

// 导出类型以在组件中使用
export type ApiClient = ReturnType<typeof createApiClient>;
