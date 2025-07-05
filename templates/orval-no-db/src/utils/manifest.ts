// 用于读取 Vite 生成的 manifest.json
import type { Context } from "hono";
import { isDev } from "./is-dev";

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
