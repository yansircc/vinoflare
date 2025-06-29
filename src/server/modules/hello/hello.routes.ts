import { z } from "zod/v4";
import { createAPI } from "@/server/core/api";

// Response schema
const helloResponseSchema = z.object({
	message: z.string().describe("Greeting message"),
	time: z.iso.datetime({ offset: true }).describe("Current timestamp"),
});

// Create hello module routes using new API builder
export function createHelloRoutes() {
	return createAPI()
		.tags("Hello")
		.get("/", {
			summary: "Hello endpoint",
			description: "Returns a greeting message with current timestamp",
			response: helloResponseSchema,
			handler: (c) => {
				return c.json({
					message: "Hello from API!",
					time: new Date().toISOString(),
				});
			},
		})
		.build();
}
