/**
 * 路由配置文件
 * 在这里集中管理所有需要特殊处理的路由
 */

// 重要：所有 API 路由默认需要认证，只有在这里列出的路由才能公开访问
// 添加新路由时请谨慎考虑是否真的需要公开访问
export const PUBLIC_API_ROUTES = [
	"/api/hello", // 测试端点
	// Better Auth 的公开端点（不包括需要认证的端点）
	"/api/auth/sign-in/*", // 登录端点
	"/api/auth/sign-up/*", // 注册端点
	"/api/auth/sign-out", // 登出端点（需要会话但由 Better Auth 内部处理）
	"/api/auth/callback/*", // OAuth 回调
	"/api/auth/verify-email", // 邮箱验证
	"/api/auth/forgot-password", // 忘记密码
	"/api/auth/reset-password", // 重置密码
	"/api/auth/get-session", // 获取会话（Better Auth 内部使用）
	"/api/openapi.json", // OpenAPI 文档
	"/api/docs", // API 文档界面
	"/api/docs/*", // API 文档相关资源
	"/api/health", // 健康检查端点
] as const;
