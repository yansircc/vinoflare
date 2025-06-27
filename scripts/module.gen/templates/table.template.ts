import type { NameVariations } from "../utils";

export const getTableTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * ${pascal} table definition
 * This is self-contained within the ${kebab} module
 */
export const ${camel} = sqliteTable("${camel}", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	
	// TODO: Add your fields here
	name: text("name").notNull(),
	description: text("description"),
	
	// Add more fields as needed
	// Example fields:
	// status: text("status", { enum: ["active", "inactive"] }).default("active"),
	// price: integer("price"), // Store as cents to avoid floating point issues
	// quantity: integer("quantity").default(0),
	// isPublished: integer("is_published", { mode: "boolean" }).default(false),
	
	// Timestamps
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql\`(unixepoch())\`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql\`(unixepoch())\`)
		.\$onUpdate(() => new Date()),
});`;