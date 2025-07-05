/** @jsxImportSource hono/jsx */

import { jsxRenderer } from "hono/jsx-renderer";
import { getAssetPaths } from "@/utils/manifest";

export const renderer = jsxRenderer(async ({ children }, c) => {
	// 获取资源路径
	const { scriptPath, cssPath } = await getAssetPaths(c);

	return (
		<html lang="zh-CN">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Vinoflare App</title>
				<link href={cssPath} rel="stylesheet" />
				<link rel="icon" href="/favicon.ico" />
			</head>
			<body>
				{children}
				<script type="module" src={scriptPath} />
			</body>
		</html>
	);
});
