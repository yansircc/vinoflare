import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import type { BaseContext } from "@/server/lib/worker-types";
import { authHandler } from "./auth.handlers";

// User schema for OpenAPI
const userSchema = z.object({
	id: z.string().describe("User ID"),
	name: z.string().describe("User name"),
	email: z.string().email().describe("User email"),
	emailVerified: z.boolean().describe("Email verification status"),
	image: z.string().nullable().describe("User profile image URL"),
	createdAt: z.iso.datetime().describe("User creation timestamp"),
	updatedAt: z.iso.datetime().describe("User last update timestamp"),
});

// Route definition for getting current user
const getCurrentUserRoute = createRoute({
	method: "get",
	path: "/user",
	tags: ["Authentication"],
	summary: "Get current user",
	description: "Returns the currently authenticated user",
	responses: {
		200: {
			description: "Current user information",
			content: {
				"application/json": {
					schema: z.object({
						user: userSchema,
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							timestamp: z.string(),
							path: z.string(),
						}),
					}),
				},
			},
		},
		403: {
			description: "Forbidden",
			content: {
				"application/json": {
					schema: z.object({
						error: z.object({
							code: z.string(),
							message: z.string(),
							timestamp: z.string(),
							path: z.string(),
						}),
					}),
				},
			},
		},
	},
});

// Create module routes
export const createAuthModule = () => {
	const app = new OpenAPIHono<BaseContext>();

	// Get current user - with OpenAPI definition
	app.openapi(getCurrentUserRoute, async (c) => {
		const user = c.get("user");

		if (!user) {
			throw new HTTPException(401, {
				message: "Not authenticated",
			});
		}

		// Ensure all required fields are present for OpenAPI schema
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
	});

	// Better-auth endpoints - handle all HTTP methods
	// These are internal Better Auth routes, so no OpenAPI definitions
	app.get("/*", authHandler);
	app.post("/*", authHandler);
	app.put("/*", authHandler);
	app.delete("/*", authHandler);
	app.patch("/*", authHandler);

	return app;
};
