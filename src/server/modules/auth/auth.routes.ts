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

				// Ensure all required fields are present for schema
				return c.json(
					{
						user: {
							id: user.id,
							name: user.name || "",
							email: user.email || "",
							emailVerified: user.emailVerified || false,
							image: user.image || null,
							createdAt: user.createdAt
								? new Date(user.createdAt).toISOString()
								: new Date().toISOString(),
							updatedAt: user.updatedAt
								? new Date(user.updatedAt).toISOString()
								: new Date().toISOString(),
						},
					},
					200,
				);
			},
		});

	// Get the built app
	const app = api.build();

	// Better-auth endpoints - handle all HTTP methods
	// These are internal Better Auth routes, so no OpenAPI definitions
	app.get("/*", authHandler);
	app.post("/*", authHandler);
	app.put("/*", authHandler);
	app.delete("/*", authHandler);
	app.patch("/*", authHandler);

	return app;
};
