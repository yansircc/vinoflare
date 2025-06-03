import { Scalar } from "@scalar/hono-api-reference";
import { dynamicOpenAPIMiddleware } from "../middleware";
import type { AppOpenAPI } from "./types";

/**
 * 配置 OpenAPI 文档和 API 参考
 */
export default function configureOpenAPI(app: AppOpenAPI) {
	// 应用动态配置中间件
	app.use(dynamicOpenAPIMiddleware);

	// 配置 OpenAPI 文档端点
	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Vinoflare API",
			description: "基于 Vite，Hono 和 Cloudflare Workers 的 API",
		},
		servers: [], // 这次字段会被 dynamicOpenAPIMiddleware 覆盖
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
