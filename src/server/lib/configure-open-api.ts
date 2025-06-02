import { Scalar } from "@scalar/hono-api-reference";
import type { AppOpenAPI } from "./types";

/**
 * 配置 OpenAPI 文档和 API 参考
 */
export default function configureOpenAPI(app: AppOpenAPI) {
	// 配置 OpenAPI 文档端点
	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Tasks API",
			description: "基于 Hono 和 Cloudflare Workers 的任务管理 API",
		},
		servers: [
			{
				url: "http://localhost:5173",
				description: "本地开发环境",
			},
		],
	});

	// 配置 Scalar API 参考界面
	app.get(
		"/reference",
		Scalar({
			theme: "kepler",
			layout: "classic",
			url: "/doc",
			defaultHttpClient: {
				targetKey: "js",
				clientKey: "fetch",
			},
		}),
	);
}
