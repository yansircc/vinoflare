import type { NameVariations } from "../utils";

export const getSchemaTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ${camel} } from "./${kebab}.table";

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

// Database schemas
export const select${pascal}Schema = createSelectSchema(${camel}, {
	id: ${camel}IdSchema,
	name: ${camel}NameSchema,
	createdAt: z.iso.datetime({ offset: true }),
	updatedAt: z.iso.datetime({ offset: true }),
});
export const insert${pascal}Schema = createInsertSchema(${camel})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
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
});

export const ${camel}DeleteResponseSchema = z.object({
	message: z.string(),
});`;