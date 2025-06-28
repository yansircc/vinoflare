import { drizzle } from "drizzle-orm/d1";
import { account, jwks, session, user, verification } from "../modules/auth";
import { posts } from "../modules/posts";

// Combine core schema with module schemas
// Note: We're importing auth tables from the module now
const schema = {
	// Auth tables (from auth module)
	user,
	session,
	account,
	verification,
	jwks,
	// Other module tables
	posts,
};

export function createDb(d1: D1Database) {
	return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;

// Note: Tables are now exported from their respective modules
