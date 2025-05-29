/** @jsxImportSource hono/jsx */
import { jsxRenderer } from "hono/jsx-renderer";
// 在构建时会被替换为实际的资源路径
import assetsManifest from "./assets-manifest.json";

export const renderer = jsxRenderer(({ children }, c) => {
	// 在 Cloudflare Workers 中检测环境
	const isDev = c?.env?.NODE_ENV === "development";

	return (
		<html lang="zh-CN">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>留言板系统</title>
				{/* CSS 引用 - 使用资源清单中的路径 */}
				{isDev ? (
					<link href="/src/app.css" rel="stylesheet" />
				) : (
					<link href={assetsManifest.css} rel="stylesheet" />
				)}
			</head>
			<body>
				{children}
				{isDev ? (
					<script type="module" src="/src/client.tsx" />
				) : (
					<script type="module" src={assetsManifest.js} />
				)}
			</body>
		</html>
	);
});
