import type { NameVariations } from "../utils";

export const getRoutesTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { createCRUDAPI } from "@/server/core/api";
import { ${camel} } from "./${kebab}.table";
import { select${pascal}Schema, insert${pascal}Schema, update${pascal}Schema } from "./${kebab}.schema";

/**
 * ${pascal} API routes using the CRUD generator
 * 
 * This automatically generates all standard CRUD operations:
 * - GET /${kebab}s - Get all ${camel}s with pagination
 * - GET /${kebab}s/:id - Get ${camel} by ID
 * - POST /${kebab}s - Create new ${camel}
 * - PUT /${kebab}s/:id - Update ${camel}
 * - DELETE /${kebab}s/:id - Delete ${camel}
 */
export function create${pascal}Routes() {
	return createCRUDAPI({
		name: "${camel}",
		table: ${camel},
		schemas: {
			select: select${pascal}Schema,
			insert: insert${pascal}Schema,
			update: update${pascal}Schema,
		},
		tags: ["${pascal}"],
		// Add custom handlers if needed
		handlers: {
			// Example: Add custom validation
			// beforeCreate: async (data, c) => {
			//   // Custom validation logic
			//   return data;
			// },
		},
	}).build();
}`;