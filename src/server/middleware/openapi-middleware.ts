import { createMiddleware } from "hono/factory";
import type { BaseContext } from "../lib/types";

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
