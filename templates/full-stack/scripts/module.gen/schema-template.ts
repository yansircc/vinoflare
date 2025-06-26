import type { NameVariations } from "./utils";

export function getSchemaTemplate({ pascal, camel }: NameVariations): string {
	return `// Add this to your src/server/db/schema.ts file

export const ${camel} = sqliteTable("${camel}", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	// TODO: Add your fields here
	// Example fields:
	// name: text("name", { length: 255 }).notNull(),
	// description: text("description"),
	// status: text("status", { enum: ["active", "inactive"] }).default("active"),
	// userId: text("user_id")
	//   .notNull()
	//   .references(() => users.id, { onDelete: "cascade" }),
	createdAt: text("created_at")
		.default(sql\`(CURRENT_TIMESTAMP)\`)
		.notNull(),
	updatedAt: text("updated_at")
		.default(sql\`(CURRENT_TIMESTAMP)\`)
		.notNull(),
});

// Type exports
export type Select${pascal} = typeof ${camel}.$inferSelect;
export type Insert${pascal} = typeof ${camel}.$inferInsert;

// Schema exports for validation
export const select${pascal}Schema = createSelectSchema(${camel});
export const insert${pascal}Schema = createInsertSchema(${camel});`;
}
