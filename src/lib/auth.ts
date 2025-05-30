import type { ApiType } from "@/server/api";
import { createAuthClient } from "better-auth/react";
import { hc } from "hono/client";

// 创建 Better Auth 客户端
export const authClient = createAuthClient({
	baseURL:
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:5173",
	basePath: "/api/auth", // Better Auth 路由的前缀
});

// 导出认证方法
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Better Auth 集成的 API 辅助函数
export const apiHelpers = {
	// 检查是否已认证（使用 Better Auth 会话）
	async isAuthenticated() {
		try {
			const session = await getSession();
			return !!session.data;
		} catch {
			return false;
		}
	},

	// 创建带认证的客户端实例（会自动包含 cookies）
	createAuthenticatedClient() {
		const url =
			typeof window !== "undefined"
				? window.location.origin
				: "http://localhost:5173";

		return hc<ApiType>(url, {
			init: {
				credentials: "include", // 包含 cookies，Better Auth 会自动处理认证
				headers: {
					"Content-Type": "application/json",
				},
			},
		});
	},

	// Discord 登录处理
	async handleDiscordLogin() {
		try {
			const result = await authClient.signIn.social({
				provider: "discord",
				callbackURL: "/",
			});

			return result;
		} catch (error) {
			console.error("Discord login error:", error);
			throw error;
		}
	},

	// 登出处理
	async handleSignOut() {
		try {
			await signOut();
		} catch (error) {
			console.error("Logout error:", error);
			throw error;
		}
	},
};

// 认证客户端实例
export const authenticatedClient = apiHelpers.createAuthenticatedClient().api;
