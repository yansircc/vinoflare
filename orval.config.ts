import { defineConfig } from "orval";

export default defineConfig({
	tasksStore: {
		input: {
			target: "http://localhost:5173/doc",
		},
		output: {
			mode: "tags-split",
			target: "./src/hooks/gen",
			schemas: "./src/hooks/gen/model",
			biome: true,
			client: "react-query",
			httpClient: "fetch",
			override: {
				fetch: {
					includeHttpResponseReturnType: false,
				},
				mutator: {
					path: "./src/lib/custom-fetch.ts",
					name: "customFetch",
				},
			},
			baseUrl: "/",
		},
	},
});
