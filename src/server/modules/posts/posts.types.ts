import { z } from "zod/v4";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { posts } from "./posts.table";
import { 
	selectPostSchema, 
	insertPostSchema, 
	updatePostSchema 
} from "./posts.schema";

/**
 * Database types (from Drizzle)
 */
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

/**
 * API types (from Zod schemas)
 */
export type SelectPost = z.infer<typeof selectPostSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

/**
 * Response types
 */
export interface PostResponse {
	post: SelectPost;
}

export interface PostsListResponse {
	posts: SelectPost[];
}

export interface PostsQueryParams {
	search?: string;
	limit?: string;
	offset?: string;
	sortBy?: keyof Post;
	order?: 'asc' | 'desc';
}