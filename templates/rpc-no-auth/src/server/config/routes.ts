/**
 * 路由配置文件
 * 在这里集中管理所有需要特殊处理的路由
 */

// Public API routes (no authentication required)
export const PUBLIC_API_ROUTES = [
	"/api/hello", // 测试端点
	"/api/openapi.json", // OpenAPI 文档
	"/api/docs", // API 文档界面
	"/api/docs/*", // API 文档相关资源
	"/api/health", // 健康检查端点
] as const;
