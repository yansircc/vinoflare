import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import { createAPI, createCRUDAPI, response } from "@/server/core/api";
import {
	createPostHandler,
	getLatestPostHandler,
	getPostByIdHandler,
} from "./posts.handlers";
import {
	insertPostSchema,
	selectPostSchema,
	updatePostSchema,
} from "./posts.schema";
import { posts } from "./posts.table";

/**
 * Posts API routes using the new API builder
 * This demonstrates both manual route creation and CRUD generator usage
 */

// Option 1: Create routes manually with the API builder
export function createPostsRoutes() {
	const api = createAPI()
		.tags("Posts")

		// Get latest post
		.get("/latest", {
			summary: "Get latest post",
			description: "Retrieve the most recently created post",
			response: response("post", selectPostSchema),
			handler: async (c) => {
				return getLatestPostHandler(c);
			},
		})

		// Get post by ID
		.get("/:id", {
			summary: "Get post by ID",
			params: z.object({ id: z.coerce.number() }),
			response: response("post", selectPostSchema),
			handler: async (c) => {
				const id = c.req.param("id");
				return getPostByIdHandler(c, { params: { id: Number(id) } });
			},
		})

		// Create post
		.post("/", {
			summary: "Create a new post",
			body: insertPostSchema,
			response: response("post", selectPostSchema),
			status: 201,
			handler: async (c) => {
				const body = await c.req.json();
				return createPostHandler(c, { body });
			},
		});

	return api.build();
}

// Option 2: Use CRUD generator for standard operations
export function createPostsCRUDRoutes() {
	return createCRUDAPI({
		name: "post",
		table: posts,
		schemas: {
			select: selectPostSchema,
			insert: insertPostSchema,
			update: updatePostSchema,
		},
		tags: ["Posts"],
		// Custom handlers can override default CRUD behavior
		handlers: {
			beforeCreate: async (data: any, c: any) => {
				// Check for duplicate title
				const db = c.get("db");
				const existing = await db.query.posts.findFirst({
					where: (postsTable: any, { eq }: any) =>
						eq(postsTable.title, data.title),
				});

				if (existing) {
					throw new HTTPException(409, {
						message: `Post with title "${data.title}" already exists`,
					});
				}

				return data;
			},
		},
	}).build();
}

// Export the manually created routes as default for now
export default createPostsRoutes();
