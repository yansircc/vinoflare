import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "path";

export default defineWorkersConfig({
	test: {
		setupFiles: ["./src/server/tests/setup.ts"],
		poolOptions: {
			workers: {
				wrangler: { 
					configPath: "./wrangler.toml",
				},
				miniflare: {
					bindings: {
						ENVIRONMENT: "test",
					},
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@server": path.resolve(__dirname, "./src/server"),
		},
	},
});