import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { BaseContext } from "@/server/core/worker-types";
import { database } from "@/server/middleware/database";
import {
	createPostHandler,
	getLatestPostHandler,
	getPostByIdHandler,
} from "./posts.handlers";
import {
	insertPostSchema,
	postIdSchema,
	selectPostSchema,
} from "./posts.schema";

// Route definitions
const getLatestPostRoute = createRoute({
	method: "get",
	path: "/latest",
	tags: ["Posts"],
	summary: "Get latest post",
	description: "Retrieves the most recent post",
	responses: {
		200: {
			description: "Post retrieved successfully",
			content: {
				"application/json": {
					schema: z.object({
						post: selectPostSchema,
					}),
				},
			},
		},
		404: {
			description: "Post not found",
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
		500: {
			description: "Internal server error",
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

const createPostRoute = createRoute({
	method: "post",
	path: "/",
	tags: ["Posts"],
	summary: "Create a new post",
	description: "Creates a new post",
	request: {
		body: {
			content: {
				"application/json": {
					schema: insertPostSchema,
				},
			},
			description: "Post data",
			required: true,
		},
	},
	responses: {
		201: {
			description: "Post created successfully",
			content: {
				"application/json": {
					schema: z.object({
						post: selectPostSchema,
					}),
				},
			},
		},
		400: {
			description: "Validation error",
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
		409: {
			description: "Post already exists",
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
		500: {
			description: "Internal server error",
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

const getPostByIdRoute = createRoute({
	method: "get",
	path: "/:id",
	tags: ["Posts"],
	summary: "Get post by ID",
	description: "Retrieves a specific post",
	request: {
		params: z.object({
			id: postIdSchema,
		}),
	},
	responses: {
		200: {
			description: "Post retrieved successfully",
			content: {
				"application/json": {
					schema: z.object({
						post: selectPostSchema,
					}),
				},
			},
		},
		400: {
			description: "Invalid path parameters",
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
		404: {
			description: "Post not found",
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
		500: {
			description: "Internal server error",
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

export function createPostsModule() {
	const app = new OpenAPIHono<BaseContext>();

	// Apply middleware
	app.use(database());

	// Register routes
	app.openapi(getLatestPostRoute, async (c) => {
		return getLatestPostHandler(c);
	});

	app.openapi(createPostRoute, async (c) => {
		const body = c.req.valid("json");
		return createPostHandler(c, { body });
	});

	app.openapi(getPostByIdRoute, async (c) => {
		const params = c.req.valid("param");
		return getPostByIdHandler(c, { params });
	});

	return app;
}
