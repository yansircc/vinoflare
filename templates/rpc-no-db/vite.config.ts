import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
	// 客户端构建模式
	if (mode === "client") {
		return {
			base: "/",
			plugins: [
				tanstackRouter({
					target: "react",
					routesDirectory: "./src/client/routes",
					generatedRouteTree: "./src/generated/routeTree.gen.ts",
				}),
				tailwindcss(),
			],
			resolve: {
				alias: {
					"@": path.resolve(__dirname, "./src"),
					"@client": path.resolve(__dirname, "./src/client"),
					"@server": path.resolve(__dirname, "./src/server"),
				},
			},
			build: {
				outDir: "dist/client",
				manifest: true,
				rollupOptions: {
					input: "./src/client/client.tsx",
					onwarn(warning, warn) {
						// 忽略 "use client" 指令警告
						if (
							warning.message.includes(
								"Module level directives cause errors when bundled",
							) ||
							warning.message.includes('"use client"')
						) {
							return;
						}
						warn(warning);
					},
				},
			},
		};
	}

	// 服务端开发和构建模式
	return {
		plugins: [
			tanstackRouter({
				target: "react",
				routesDirectory: "./src/client/routes",
				generatedRouteTree: "./src/generated/routeTree.gen.ts",
			}),
			cloudflare({
				configPath: "./wrangler.jsonc",
				persistState: true,
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
				"@client": path.resolve(__dirname, "./src/client"),
				"@server": path.resolve(__dirname, "./src/server"),
			},
		},
		ssr: {
			external: ["node:async_hooks"],
		},
		build: {
			ssr: true,
			emptyOutDir: false,
			rollupOptions: {
				onwarn(warning, warn) {
					// 忽略 "use client" 指令警告
					if (
						warning.message.includes(
							"Module level directives cause errors when bundled",
						) ||
						warning.message.includes('"use client"')
					) {
						return;
					}
					warn(warning);
				},
			},
		},
	};
});
