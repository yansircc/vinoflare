import type { NameVariations } from "../utils";

export const getSchemaTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ${camel} } from "./${kebab}.table";

/**
 * Field validation schemas
 */
const ${camel}IdSchema = z
	.number()
	.int()
	.positive()
	.meta({ example: 1 })
	.describe("Unique identifier of the ${camel}");

const ${camel}NameSchema = z
	.string()
	.min(1, "Name is required")
	.max(255, "Name must be 255 characters or less")
	.trim()
	.meta({ example: "${pascal} Name" })
	.describe("Name of the ${camel}");

const ${camel}DescriptionSchema = z
	.string()
	.max(1000, "Description must be 1000 characters or less")
	.optional()
	.nullable()
	.meta({ example: "Description of the ${camel}" })
	.describe("Description of the ${camel}");

const ${camel}CreatedAtSchema = z
	.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Creation timestamp");

const ${camel}UpdatedAtSchema = z
	.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Last update timestamp");

/**
 * CRUD schemas
 */
export const select${pascal}Schema = createSelectSchema(${camel}, {
	id: ${camel}IdSchema,
	name: ${camel}NameSchema,
	description: ${camel}DescriptionSchema,
	createdAt: ${camel}CreatedAtSchema,
	updatedAt: ${camel}UpdatedAtSchema,
});

export const insert${pascal}Schema = createInsertSchema(${camel}, {
	name: ${camel}NameSchema,
	description: ${camel}DescriptionSchema,
})
	.required({
		name: true,
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	});

export const update${pascal}Schema = insert${pascal}Schema.partial();

// Export individual field schemas for reuse
export {
	${camel}IdSchema,
	${camel}NameSchema,
	${camel}DescriptionSchema,
	${camel}CreatedAtSchema,
	${camel}UpdatedAtSchema,
};`;