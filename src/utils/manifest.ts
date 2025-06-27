// 用于读取 Vite 生成的 manifest.json
import type { Context } from "hono";

interface ManifestEntry {
	file: string;
	name?: string;
	src?: string;
	isEntry?: boolean;
	css?: string[];
}

interface Manifest {
	[key: string]: ManifestEntry;
}

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

export async function getAssetPaths(
	c: Context<{ Bindings: CloudflareBindings }>,
) {
	if (isDev()) {
		// 开发环境直接返回源文件路径
		return {
			scriptPath: "/src/client/client.tsx",
			cssPath: "/src/client/app.css",
		};
	}

	try {
		// 生产环境从 ASSETS 绑定读取 manifest.json
		const manifestResponse = await c.env.ASSETS.fetch(
			new Request("https://dummy/.vite/manifest.json"),
		);
		if (!manifestResponse.ok) {
			throw new Error("Failed to fetch manifest.json");
		}

		const manifest: Manifest = await manifestResponse.json();

		// 查找入口文件
		const entry = manifest["src/client/client.tsx"];
		if (!entry) {
			throw new Error("Entry not found in manifest");
		}

		const scriptPath = `/${entry.file}`;
		const cssPath =
			entry.css && entry.css.length > 0 ? `/${entry.css[0]}` : "/src/app.css";

		return {
			scriptPath,
			cssPath,
		};
	} catch (error) {
		console.error("Error reading manifest:", error);
		// 降级到默认路径
		return {
			scriptPath: "/src/client/client.tsx",
			cssPath: "/src/client/app.css",
		};
	}
}
