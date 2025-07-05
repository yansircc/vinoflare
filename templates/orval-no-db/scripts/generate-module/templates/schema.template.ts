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

// Manual schemas (no database dependency)
export const select${pascal}Schema = z.object({
	id: ${camel}IdSchema,
	name: ${camel}NameSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const insert${pascal}Schema = z.object({
	name: ${camel}NameSchema,
});

export const update${pascal}Schema = insert${pascal}Schema.partial();

export type Select${pascal} = z.infer<typeof select${pascal}Schema>;
export type Insert${pascal} = z.infer<typeof insert${pascal}Schema>;
export type Update${pascal} = z.infer<typeof update${pascal}Schema>;
export type ${pascal}Id = z.infer<typeof ${camel}IdSchema>;

// Response schemas for API endpoints
export const ${camel}ResponseSchema = z.object({
	${camel}: select${pascal}Schema,
});

export const ${camel}ListResponseSchema = z.object({
	${camel}s: z.array(select${pascal}Schema),
});`;