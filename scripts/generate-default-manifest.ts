import fs from "node:fs";
import path from "node:path";

/**
 * 生成默认的 assets-manifest.json 文件
 * 用于开发环境，避免文件不存在导致的编译错误
 */
function generateDefaultManifest() {
	const defaultAssets = {
		js: "/static/client.js",
		css: "/assets/client.css"
	};

	const manifestPath = path.join(process.cwd(), "src/assets-manifest.json");
	
	// 如果文件不存在，则创建默认文件
	if (!fs.existsSync(manifestPath)) {
		fs.writeFileSync(manifestPath, JSON.stringify(defaultAssets, null, 2));
		console.log("✅ Generated default assets-manifest.json for development");
	}
}

generateDefaultManifest();