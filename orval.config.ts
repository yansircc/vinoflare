import { defineConfig } from "orval";

export default defineConfig({
	vinoflare: {
		input: "./src/generated/openapi.json",
		output: {
			mode: "tags-split",
			target: "./src/generated/endpoints",
			schemas: "./src/generated/schemas",
			client: "react-query",
			httpClient: "fetch",
			baseUrl: "/api",
			override: {
				query: {
					useQuery: true,
					useMutation: true,
					signal: true,
				},
			},
		},
	},
});
