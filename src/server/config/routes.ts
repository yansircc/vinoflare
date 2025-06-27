/**
 * 路由配置文件
 * 在这里集中管理所有需要特殊处理的路由
 */

// 重要：所有 API 路由默认需要认证，只有在这里列出的路由才能公开访问
// 添加新路由时请谨慎考虑是否真的需要公开访问
export const PUBLIC_API_ROUTES = [
	"/api/hello", // 测试端点
	"/api/auth/*", // Better Auth 的认证端点（登录、注册等）
	"/api/openapi.json", // OpenAPI 文档
	"/api/docs", // API 文档界面
	"/api/docs/*", // API 文档相关资源
	"/api/health", // 健康检查端点
] as const;

// 静态资源路径
export const STATIC_ROUTES = [
	"/assets/*", // 前端资源
	"/.vite/*", // Vite 相关文件
	"/favicon.ico", // 网站图标
] as const;
