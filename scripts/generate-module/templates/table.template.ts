import type { NameVariations } from "../utils";

export const getTableTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ${camel} = sqliteTable("${camel}", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	
	// Core fields
	name: text("name").notNull(),
	
	// User association
	userId: text("user_id").notNull(),
	
	// Timestamps
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql\`(unixepoch())\`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql\`(unixepoch())\`)
		.\$onUpdate(() => new Date()),
});`;