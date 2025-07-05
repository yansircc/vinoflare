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
