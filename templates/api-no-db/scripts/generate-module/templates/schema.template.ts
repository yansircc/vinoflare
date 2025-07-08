import type { NameVariations } from "../utils";

export const getSchemaTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { z } from "zod/v4";

// ID validation for params
export const ${camel}IdSchema = z.coerce
	.number()
	.int()
	.positive()
	.meta({ example: 1 })
	.describe("${pascal} ID");

export const ${camel}NameSchema = z
	.string()
	.min(1)
	.max(255)
	.meta({ example: "John Doe" })
	.describe("${pascal} name");

// Base schema
export const ${camel}Schema = z.object({
	id: ${camel}IdSchema,
	name: ${camel}NameSchema,
	createdAt: z.date().or(z.string().datetime()),
	updatedAt: z.date().or(z.string().datetime()),
});

// Insert schema (without auto-generated fields)
export const insert${pascal}Schema = z.object({
	name: ${camel}NameSchema,
});

// Update schema (all fields optional)
export const update${pascal}Schema = insert${pascal}Schema.partial();

// Type exports
export type ${pascal} = z.infer<typeof ${camel}Schema>;
export type Insert${pascal} = z.infer<typeof insert${pascal}Schema>;
export type Update${pascal} = z.infer<typeof update${pascal}Schema>;
export type ${pascal}Id = z.infer<typeof ${camel}IdSchema>;

// Response schemas for API endpoints
export const ${camel}ResponseSchema = z.object({
	${camel}: ${camel}Schema,
});

export const ${camel}ListResponseSchema = z.object({
	${camel}s: z.array(${camel}Schema),
});`;