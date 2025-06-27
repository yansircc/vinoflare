import { drizzle } from "drizzle-orm/d1";
import * as coreSchema from "./tables";
import { posts } from "../modules/posts";

// Combine core schema with module schemas
const schema = {
	...coreSchema,
	posts, // Include posts table from the module
};

export function createDb(d1: D1Database) {
	return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;

// Export tables for backward compatibility
export * from "./tables";
