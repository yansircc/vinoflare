import { HTTPException } from "hono/http-exception";
import { createCRUDAPI } from "@/server/core/api";
import {
	insertPostSchema,
	selectPostSchema,
	updatePostSchema,
} from "./posts.schema";
import { posts } from "./posts.table";

/**
 * Posts API routes using the CRUD generator
 *
 * This automatically generates all standard CRUD operations:
 * - GET /posts - Get all posts with pagination
 * - GET /posts/:id - Get post by ID
 * - POST /posts - Create new post
 * - PUT /posts/:id - Update post
 * - DELETE /posts/:id - Delete post
 */
export function createPostsRoutes() {
	return createCRUDAPI({
		name: "post",
		table: posts,
		schemas: {
			select: selectPostSchema,
			insert: insertPostSchema,
			update: updatePostSchema,
		},
		tags: ["Posts"],
		// Custom handlers for business logic
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
