/** @jsxImportSource hono/jsx */

import type { Context, Next } from "hono";
import { getAssetPaths } from "@/utils/manifest";

export const renderer = async (c: Context, next: Next) => {
	// 获取资源路径
	const { scriptPath, cssPath } = await getAssetPaths(c);

	// Set the HTML content
	c.setRenderer((_content) => {
		return c.html(
			<html lang="zh-CN">
				<head>
					<meta charSet="UTF-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<title>Vinoflare App</title>
					<link href={cssPath} rel="stylesheet" />
					<link rel="icon" href="/favicon.ico" />
				</head>
				<body>
					<div id="root" />
					<script type="module" src={scriptPath} />
				</body>
			</html>,
		);
	});

	await next();
};
