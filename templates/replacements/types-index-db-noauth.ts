// Type definitions for projects with database but no auth
import { z } from "zod/v4";
import * as schemas from "../schemas/database";

// Database types
export type SelectPost = z.infer<typeof schemas.selectPostSchema>;
export type InsertPost = z.infer<typeof schemas.insertPostSchema>;
export type Post = SelectPost;

// Context types
export interface CloudflareBindings {
	ENVIRONMENT: string;
	DB: D1Database;
}

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		db: D1Database;
	};
}