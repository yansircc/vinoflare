import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { BaseContext } from "@/server/lib/worker-types";

export const helloRoute = createRoute({
	method: "get",
	path: "/",
	responses: {
		200: {
			description: "Hello from API!",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string().describe("Greeting message"),
						time: z.iso.datetime().describe("Current timestamp"),
					}),
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string().describe("Error message"),
					}),
				},
			},
		},
	},
});

export function createHelloRoutes() {
	const app = new OpenAPIHono<BaseContext>();

	app.openapi(helloRoute, (c) => {
		return c.json({
			message: "Hello from API!",
			time: new Date().toISOString(),
		});
	});

	return app;
}
