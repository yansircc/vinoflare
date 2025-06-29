import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import { commonErrors, createAPI, response } from "@/server/core/api";
import {
	insertPostSchema,
	selectPostSchema,
	updatePostSchema,
} from "./posts.schema";
import { posts } from "./posts.table";

/**
 * Posts API routes with appropriate error handling
 */
export function createPostsRoutes() {
	return (
		createAPI()
			.tags("Posts")

			// List all posts
			.get("/", {
				summary: "Get all posts",
				description: "Retrieve a paginated list of posts",
				query: z.object({
					page: z.coerce.number().positive().default(1),
					limit: z.coerce.number().positive().max(100).default(10),
				}),
				response: z.object({
					posts: z.array(selectPostSchema),
					pagination: z.object({
						page: z.number(),
						limit: z.number(),
						total: z.number(),
						totalPages: z.number(),
					}),
				}),
				includeStandardErrors: false,
				errors: {
					400: "Invalid pagination parameters",
					500: "Failed to retrieve posts",
				},
				handler: async (c) => {
					const query = c.req.query();
					const page = Number(query.page) || 1;
					const limit = Number(query.limit) || 10;
					const db = c.get("db");

					const offset = (page - 1) * limit;

					// Get total count
					const countResult = await db
						.select({ count: sql<number>`count(*)` })
						.from(posts);
					const total = countResult[0]?.count || 0;

					// Get paginated results
					const postsList = await db
						.select()
						.from(posts)
						.limit(limit)
						.offset(offset)
						.orderBy(desc(posts.id));

					return c.json({
						posts: postsList,
						pagination: {
							page,
							limit,
							total,
							totalPages: Math.ceil(total / limit),
						},
					});
				},
			})

			// Get post by ID
			.get("/:id", {
				summary: "Get post by ID",
				description: "Retrieve a single post by its ID",
				params: z.object({ id: z.coerce.number().positive() }),
				response: response("post", selectPostSchema),
				includeStandardErrors: false,
				errors: commonErrors.crud, // 400, 404, 409, 422
				handler: async (c) => {
					const id = Number(c.req.param("id"));
					const db = c.get("db");

					const result = await db
						.select()
						.from(posts)
						.where(eq(posts.id, id))
						.limit(1);

					if (!result[0]) {
						throw new HTTPException(404, {
							message: "Post not found",
						});
					}

					return c.json({ post: result[0] });
				},
			})

			// Create new post
			.post("/", {
				summary: "Create a new post",
				description: "Create a new post with the given title",
				body: insertPostSchema,
				response: response("post", selectPostSchema),
				status: 201,
				includeStandardErrors: false,
				errors: {
					400: "Invalid post data",
					409: "Post with this title already exists",
					422: "Title is required and must be valid",
					500: "Failed to create post",
				},
				handler: async (c) => {
					const data = await c.req.json<{ title: string }>();
					const db = c.get("db");

					// Check for duplicate title
					const existing = await db.query.posts.findFirst({
						where: (postsTable: any, { eq }: any) =>
							eq(postsTable.title, data.title),
					});

					if (existing) {
						throw new HTTPException(409, {
							message: `Post with title "${data.title}" already exists`,
						});
					}

					const [newPost] = await db.insert(posts).values(data).returning();

					return c.json({ post: newPost }, 201);
				},
			})

			// Update post
			.put("/:id", {
				summary: "Update post",
				description: "Update an existing post",
				params: z.object({ id: z.coerce.number().positive() }),
				body: updatePostSchema,
				response: response("post", selectPostSchema),
				includeStandardErrors: false,
				errors: {
					400: "Invalid update data",
					404: "Post not found",
					409: "Post with this title already exists",
					422: "Invalid post data",
				},
				handler: async (c) => {
					const id = Number(c.req.param("id"));
					const data = await c.req.json<{ title?: string }>();
					const db = c.get("db");

					// Check if post exists
					const existing = await db
						.select()
						.from(posts)
						.where(eq(posts.id, id))
						.limit(1);

					if (!existing[0]) {
						throw new HTTPException(404, {
							message: "Post not found",
						});
					}

					// If updating title, check for duplicates
					if (data.title && data.title !== existing[0].title) {
						const duplicate = await db.query.posts.findFirst({
							where: (postsTable: any, { eq }: any) =>
								eq(postsTable.title, data.title),
						});

						if (duplicate) {
							throw new HTTPException(409, {
								message: `Post with title "${data.title}" already exists`,
							});
						}
					}

					const [updatedPost] = await db
						.update(posts)
						.set(data)
						.where(eq(posts.id, id))
						.returning();

					return c.json({ post: updatedPost });
				},
			})

			// Delete post
			.delete("/:id", {
				summary: "Delete post",
				description: "Delete a post by its ID",
				params: z.object({ id: z.coerce.number().positive() }),
				response: undefined,
				status: 204,
				includeStandardErrors: false,
				errors: {
					404: "Post not found",
					500: "Failed to delete post",
				},
				handler: async (c) => {
					const id = Number(c.req.param("id"));
					const db = c.get("db");

					const [deletedPost] = await db
						.delete(posts)
						.where(eq(posts.id, id))
						.returning();

					if (!deletedPost) {
						throw new HTTPException(404, {
							message: "Post not found",
						});
					}

					return c.body(null, 204);
				},
			})

			.build()
	);
}

// Import required functions
import { desc, sql } from "drizzle-orm";
