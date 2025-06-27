import { defineConfig } from "orval";

export default defineConfig({
	vinoflare: {
		input: "./src/generated/openapi.json",
		output: {
			mode: "tags-split",
			target: "./src/generated/endpoints",
			schemas: "./src/generated/schemas",
			client: "react-query",
			override: {
				mutator: {
					path: "./src/client/hooks/api/custom-instance.ts",
					name: "customInstance",
				},
				query: {
					useQuery: true,
					useMutation: true,
					signal: true,
				},
			},
		},
	},
});
