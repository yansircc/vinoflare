import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "path";

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { 
					configPath: "./wrangler.toml",
				},
				miniflare: {
					bindings: {
						ENVIRONMENT: "test",
						BETTER_AUTH_SECRET: "test-secret-key-for-testing-only",
						DISCORD_CLIENT_ID: "test-discord-client-id",
						DISCORD_CLIENT_SECRET: "test-discord-client-secret",
					},
				},
			},
		},
		// Setup files to run before tests
		setupFiles: ["./src/server/tests/setup.ts"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@client": path.resolve(__dirname, "./src/client"),
			"@server": path.resolve(__dirname, "./src/server"),
		},
	},
});