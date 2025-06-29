import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt } from "better-auth/plugins";
import { createDb } from "@/server/db";

export function createAuth(c: CloudflareBindings, baseURL: string) {
	const db = createDb(c.DB);

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite", // D1 使用 SQLite
		}),

		// 基础配置
		baseURL,
		secret: c.BETTER_AUTH_SECRET,

		// 禁用邮箱密码登录，只使用 Discord OAuth
		emailAndPassword: {
			enabled: false,
		},

		// 社交登录配置
		socialProviders: {
			discord: {
				clientId: c.DISCORD_CLIENT_ID,
				clientSecret: c.DISCORD_CLIENT_SECRET,
			},
		},

		// 会话配置
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 天
			updateAge: 60 * 60 * 24, // 1 天
		},

		// 插件配置 - 简化JWT配置
		plugins: [
			// 使用默认的JWT配置，避免算法兼容性问题
			jwt(),
			bearer(),
		],

		// 安全配置
		advanced: {
			// 在生产环境使用安全cookies
			useSecureCookies: c.ENVIRONMENT === "production",

			// 配置IP地址获取（Cloudflare Workers）
			ipAddress: {
				// Cloudflare Workers 提供的真实IP头
				ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
				disableIpTracking: false,
			},

			// Cookie配置
			cookiePrefix: "vinoflare-auth",
			defaultCookieAttributes: {
				httpOnly: true,
				secure: c.ENVIRONMENT === "production",
				sameSite: "lax",
			},

			// 跨子域名cookies（如果需要）
			crossSubDomainCookies: {
				enabled: false, // 根据需要启用
			},
		},

		// 速率限制配置
		rateLimit: {
			enabled: true,
			window: 60, // 60秒窗口
			max: 100, // 最多100次请求
			storage: "memory", // 在Cloudflare Workers中使用内存存储
			customRules: {
				// 登录端点更严格的限制
				"/sign-in/*": {
					window: 300, // 5分钟
					max: 5, // 最多5次尝试
				},
				// OAuth回调限制
				"/callback/*": {
					window: 60,
					max: 10,
				},
			},
		},

		// 错误处理和日志
		logger: {
			level: c.ENVIRONMENT === "development" ? "debug" : "warn",
			disabled: false,
		},
	});
}
