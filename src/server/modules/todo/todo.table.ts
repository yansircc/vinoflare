import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todo = sqliteTable("todo", {
	id: integer("id").primaryKey({ autoIncrement: true }),

	// Core fields
	title: text("title").notNull(),
	completed: integer("completed", { mode: "boolean" }).notNull().default(false),

	// User association
	userId: text("user_id").notNull(),

	// Timestamps
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
