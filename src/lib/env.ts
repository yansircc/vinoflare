import { z } from "zod";

/**
 * 简化的环境变量管理
 * 直接从运行时环境读取，避免构建时固化
 */

// 环境变量验证 schema
const envSchema = z.object({
	ENVIRONMENT: z
		.enum(["development", "production", "test"])
		.default("development"),
	DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID不能为空"),
	DISCORD_CLIENT_SECRET: z.string().min(1, "DISCORD_CLIENT_SECRET不能为空"),
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "BETTER_AUTH_SECRET至少需要32个字符")
		.optional(),
});

/**
 * 安全地获取 process.env（仅在 Node.js 环境中可用）
 */
function getProcessEnv(key: string): string | undefined {
	try {
		return typeof (globalThis as any).process !== "undefined" &&
			(globalThis as any).process.env
			? (globalThis as any).process.env[key]
			: undefined;
	} catch {
		return undefined;
	}
}

/**
 * 安全地检查是否为开发环境
 */
export function isDev(): boolean {
	try {
		// 检查 import.meta.env
		if (typeof import.meta !== "undefined" && import.meta.env) {
			return (
				import.meta.env.DEV === true ||
				import.meta.env.ENVIRONMENT === "development"
			);
		}

		// 检查 process.env
		const nodeEnv = getProcessEnv("ENVIRONMENT");
		return nodeEnv === "development";
	} catch {
		// 在 Cloudflare Workers 中，默认为生产环境
		return false;
	}
}

/**
 * 生成安全的随机字符串用于 Better Auth Secret
 */
function generateSecretKey(): string {
	// 在 Cloudflare Workers 中使用 crypto.getRandomValues
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}

/**
 * 获取环境变量
 * 在 Cloudflare Workers 中，环境变量通过 env 对象传递
 */
export function getEnv(workerEnv?: CloudflareBindings) {
	// 在 Cloudflare Workers 中，环境变量通过 env 参数传递
	const rawEnv = workerEnv || {
		ENVIRONMENT: getProcessEnv("ENVIRONMENT") || "development",
	};

	try {
		const validatedEnv = envSchema.parse(rawEnv);

		// 确保有有效的密钥
		const authSecret = validatedEnv.BETTER_AUTH_SECRET || generateSecretKey();

		// 设置默认的 Better Auth 配置
		const finalEnv = {
			...validatedEnv,
			BETTER_AUTH_SECRET: authSecret,
		};

		// 验证密钥长度
		if (finalEnv.BETTER_AUTH_SECRET.length < 32) {
			console.warn("⚠️ BETTER_AUTH_SECRET 长度不足，正在生成新的密钥");
			finalEnv.BETTER_AUTH_SECRET = generateSecretKey();
		}

		return finalEnv;
	} catch (error) {
		console.error("❌ 环境变量验证失败:", error);

		// 在开发环境中提供默认值并警告
		if (rawEnv.ENVIRONMENT === "development") {
			console.warn(
				"⚠️ 使用开发环境默认配置。请在生产环境中设置正确的环境变量。",
			);

			const devSecret = generateSecretKey();
			console.log("🔐 开发环境生成的密钥:", devSecret);

			return {
				ENVIRONMENT: rawEnv.ENVIRONMENT || "development",
			};
		}

		// 生产环境抛出错误
		throw new Error("生产环境必须设置正确的环境变量");
	}
}

/**
 * 客户端环境变量（仅包含公开信息）
 */
export const clientEnv = {
	ENVIRONMENT:
		typeof window !== "undefined"
			? (window as any).__ENV__?.ENVIRONMENT ||
				(typeof import.meta !== "undefined" && import.meta.env?.ENVIRONMENT)
			: getProcessEnv("ENVIRONMENT"),
};
