import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		cloudflare({
			configPath: "./wrangler.toml",
			persistState: true,
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@server": path.resolve(__dirname, "./src/server"),
		},
	},
	ssr: {
		external: ["node:async_hooks"],
	},
	build: {
		ssr: true,
		emptyOutDir: true,
	},
});