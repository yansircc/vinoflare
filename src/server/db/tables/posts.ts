import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Posts table definition
 */
export const posts = sqliteTable("posts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title", { length: 255 }).notNull(),
	// Using SQL function for default timestamp
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: text("updatedAt")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull()
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
