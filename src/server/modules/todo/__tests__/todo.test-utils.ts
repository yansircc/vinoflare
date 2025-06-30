import type { D1Database } from "@cloudflare/workers-types";
import type { InsertTodo } from "../todo.schema";

/**
 * Todo-specific test utilities
 */

let todoCounter = 0;

export function createTestTodo(overrides?: Partial<InsertTodo>): InsertTodo {
	todoCounter++;
	return {
		title: `Test Todo ${todoCounter}`,
		userId: "test-user-id",
		...overrides,
	} as InsertTodo;
}

export function resetTodoTestData() {
	todoCounter = 0;
}

export async function setupTodoTable(db: D1Database) {
	await db
		.prepare(`
			CREATE TABLE IF NOT EXISTS todo (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				user_id TEXT NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (unixepoch()),
				updated_at INTEGER NOT NULL DEFAULT (unixepoch())
			)
		`)
		.run();
}

export async function cleanTodoData(db: D1Database) {
	await db.prepare("DELETE FROM todo").run();
}
