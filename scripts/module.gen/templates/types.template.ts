import type { NameVariations } from "../utils";

export const getTypesTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { z } from "zod/v4";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { ${camel} } from "./${kebab}.table";
import { 
	select${pascal}Schema, 
	insert${pascal}Schema, 
	update${pascal}Schema 
} from "./${kebab}.schema";

/**
 * Database types (from Drizzle)
 */
export type ${pascal} = InferSelectModel<typeof ${camel}>;
export type New${pascal} = InferInsertModel<typeof ${camel}>;

/**
 * API types (from Zod schemas)
 */
export type Select${pascal} = z.infer<typeof select${pascal}Schema>;
export type Insert${pascal} = z.infer<typeof insert${pascal}Schema>;
export type Update${pascal} = z.infer<typeof update${pascal}Schema>;

/**
 * Response types
 */
export interface ${pascal}Response {
	${kebab.includes('-') ? 'item' : camel}: Select${pascal};
}

export interface ${pascal}ListResponse {
	${camel}: Select${pascal}[];
}

/**
 * Query parameter types
 */
export interface ${pascal}QueryParams {
	search?: string;
	limit?: string;
	offset?: string;
	sortBy?: keyof ${pascal};
	order?: 'asc' | 'desc';
}`;