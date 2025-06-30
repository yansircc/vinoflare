import type { D1Database } from "@cloudflare/workers-types";
import type { InsertPost } from "../posts.schema";

/**
 * Posts-specific test utilities
 */

let postCounter = 0;

export function createTestPost(overrides?: Partial<InsertPost>): InsertPost {
	postCounter++;
	return {
		title: `Test Post ${postCounter}`,
		...overrides,
	};
}

export function resetPostsTestData() {
	postCounter = 0;
}

export async function setupPostsTable(db: D1Database) {
	await db
		.prepare(`
			CREATE TABLE IF NOT EXISTS posts (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (unixepoch()),
				updated_at INTEGER NOT NULL DEFAULT (unixepoch())
			)
		`)
		.run();

	// Create index for title uniqueness
	await db
		.prepare(`
			CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_title ON posts(title)
		`)
		.run();
}

export async function cleanPostsData(db: D1Database) {
	await db.prepare("DELETE FROM posts").run();
}
