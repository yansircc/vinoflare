import { defineConfig } from "orval";

export default defineConfig({
	vinoflare: {
		input: "./openapi.json",
		output: {
			mode: "tags-split",
			target: "./src/hooks/api/endpoints",
			schemas: "./src/hooks/api/schemas",
			client: "react-query",
			override: {
				mutator: {
					path: "./src/hooks/api/custom-instance.ts",
					name: "customInstance",
				},
				query: {
					useQuery: true,
					useMutation: true,
					signal: true,
				},
			},
		},
		hooks: {
			afterAllFilesWrite: "bun run lint:fix",
		},
	},
});
