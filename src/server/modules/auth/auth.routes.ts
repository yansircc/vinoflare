import { HTTPException } from "hono/http-exception";
import { createAPI, response } from "@/server/core/api";
import { authHandler } from "./auth.handlers";
import { selectUserSchema } from "./auth.schema";

export const createAuthModule = () => {
	const api = createAPI()
		.tags("Authentication")

		// Get current user endpoint
		.get("/user", {
			summary: "Get current user",
			description: "Returns the currently authenticated user",
			response: response("user", selectUserSchema),
			handler: async (c) => {
				const user = c.get("user");

				if (!user) {
					throw new HTTPException(401, {
						message: "Not authenticated",
					});
				}

				return c.json({ user }, 200);
			},
		});

	const app = api.build();

	app.get("/*", authHandler);
	app.post("/*", authHandler);
	app.put("/*", authHandler);
	app.delete("/*", authHandler);
	app.patch("/*", authHandler);

	return app;
};
