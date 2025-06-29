import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { posts } from "./posts.table";

/**
 * Post field validation schemas
 */
export const postIdSchema = z.coerce
	.number()
	.int()
	.positive()
	.meta({ example: 1 })
	.describe("Unique identifier of the post");

export const postIdParamSchema = z.coerce
	.string()
	.regex(/^\d+$/, "ID must be a number")
	.transform((val) => Number(val))
	.meta({ example: "1" })
	.describe("Unique identifier of the post");

export const postTitleSchema = z
	.string()
	.min(1, "Title is required")
	.max(255, "Title must be 255 characters or less")
	.trim()
	.meta({ example: "My First Post" })
	.describe("Title of the post");

export const postCreatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Creation timestamp");

export const postUpdatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Last update timestamp");

/**
 * Post CRUD schemas
 */
export const selectPostSchema = createSelectSchema(posts, {
	id: postIdSchema,
	title: postTitleSchema,
	createdAt: postCreatedAtSchema,
	updatedAt: postUpdatedAtSchema,
});

export const insertPostSchema = createInsertSchema(posts, {
	title: postTitleSchema,
})
	.required({
		title: true,
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	});

export const updatePostSchema = insertPostSchema.partial();

export type SelectPost = z.infer<typeof selectPostSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
export type postId = z.infer<typeof postIdSchema>;
export type postIdParam = z.infer<typeof postIdParamSchema>;
