import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";
import { manifestPlugin } from "./scripts/vite-manifest-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
	if (mode === "client") {
		return {
			plugins: [
				TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
				tailwindcss(),
				manifestPlugin(),
			],
			resolve: {
				alias: [
					{ find: "@", replacement: path.resolve(__dirname, "./src") },
					{
						find: "@/components/layout",
						replacement: path.resolve(__dirname, "./src/components/layout.tsx"),
					},
					{
						find: "@/components/404",
						replacement: path.resolve(__dirname, "./src/components/404.tsx"),
					},
					{
						find: "@/components/error",
						replacement: path.resolve(__dirname, "./src/components/error.tsx"),
					},
				],
				extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
			},
			optimizeDeps: {
				include: ["react", "react-dom"],
			},
			build: {
				outDir: "dist/client",
				emptyOutDir: true,
				manifest: true,
				rollupOptions: {
					input: "./src/client.tsx",
					output: {
						entryFileNames: "static/[name]-[hash].js",
						chunkFileNames: "chunks/[name]-[hash].js",
						assetFileNames: (assetInfo) => {
							if (assetInfo.name?.endsWith(".css")) {
								return "assets/[name]-[hash].css";
							}
							return "assets/[name]-[hash][extname]";
						},
					},
				},
			},
		};
	} else {
		return {
			plugins: [
				TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
				cloudflare(),
				ssrPlugin(),
				tailwindcss(),
			],
			resolve: {
				alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
				extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
			},
		};
	}
});
