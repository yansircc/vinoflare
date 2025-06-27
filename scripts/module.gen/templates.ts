import type { NameVariations } from "./utils";

export const getHandlersTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { ${camel} } from "@/server/db/tables";
import type { BaseContext } from "@/server/lib/types";
import {
	NotFoundError,
	ValidationError,
	ConflictError,
} from "@/server/core/error-handler";

/**
 * Get all ${camel}
 */
export async function getAll${pascal}(c: Context<BaseContext>) {
	const db = c.get("db");
	
	// TODO: Add filtering, pagination, and sorting as needed
	const ${camel}List = await db.select().from(${camel});
	
	return c.json({ ${camel}: ${camel}List });
}

/**
 * Get ${camel} by ID
 */
export async function get${pascal}ById(c: Context<BaseContext>) {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	const result = await db
		.select()
		.from(${camel})
		.where(eq(${camel}.id, id))
		.limit(1);

	if (!result[0]) {
		throw new NotFoundError("${pascal} not found");
	}

	return c.json({ ${kebab.includes('-') ? 'item' : camel}: result[0] });
}

/**
 * Create a new ${camel}
 */
export async function create${pascal}(c: Context<BaseContext>) {
	const db = c.get("db");
	const data = await c.req.json();

	try {
		// TODO: Add validation logic here
		
		const [new${pascal}] = await db
			.insert(${camel})
			.values(data)
			.returning();

		return c.json({ ${kebab.includes('-') ? 'item' : camel}: new${pascal} }, 201);
	} catch (error) {
		// Handle unique constraint violations
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new ConflictError("${pascal} already exists");
		}
		throw error;
	}
}

/**
 * Update ${camel} by ID
 */
export async function update${pascal}(c: Context<BaseContext>) {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	const data = await c.req.json();
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	// TODO: Add validation and data transformation logic here

	const [updated${pascal}] = await db
		.update(${camel})
		.set(data)
		.where(eq(${camel}.id, id))
		.returning();

	if (!updated${pascal}) {
		throw new NotFoundError("${pascal} not found");
	}

	return c.json({ ${kebab.includes('-') ? 'item' : camel}: updated${pascal} });
}

/**
 * Delete ${camel} by ID
 */
export async function delete${pascal}(c: Context<BaseContext>) {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	const [deleted${pascal}] = await db
		.delete(${camel})
		.where(eq(${camel}.id, id))
		.returning();

	if (!deleted${pascal}) {
		throw new NotFoundError("${pascal} not found");
	}

	return c.json({ message: "${pascal} deleted successfully" });
}`;

export const getOpenAPITemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";
import { insert${pascal}Schema, select${pascal}Schema } from "@/server/schemas/database";

// Convert Zod schemas to JSON Schema
const ${camel}Schema = z.toJSONSchema(select${pascal}Schema);
const insert${pascal}JSONSchema = z.toJSONSchema(insert${pascal}Schema);

// Response wrapper schemas
const ${kebab.includes('-') ? 'item' : camel}ResponseSchema = {
	type: "object",
	properties: {
		${kebab.includes('-') ? 'item' : camel}: ${camel}Schema,
	},
	required: ["${kebab.includes('-') ? 'item' : camel}"],
};

const ${camel}ListResponseSchema = {
	type: "object",
	properties: {
		${camel}: {
			type: "array",
			items: ${camel}Schema,
		},
	},
	required: ["${camel}"],
};

export const getAll${pascal}OpenAPI = {
	tags: ["${pascal}"],
	summary: "Get all ${camel}",
	description: "Retrieves all ${camel} from the database",
	// TODO: Add query parameters for filtering, pagination, sorting
	responses: {
		[StatusCodes.OK]: {
			description: "${pascal} list retrieved successfully",
			schema: ${camel}ListResponseSchema,
		},
	},
};

export const get${pascal}ByIdOpenAPI = {
	tags: ["${pascal}"],
	summary: "Get ${camel} by ID",
	description: "Retrieves a specific ${camel} by its ID",
	request: {
		params: [
			{
				name: "id",
				description: "${pascal} ID",
				required: true,
				schema: { type: "integer" },
			},
		],
	},
	responses: {
		[StatusCodes.OK]: {
			description: "${pascal} retrieved successfully",
			schema: ${kebab.includes('-') ? 'item' : camel}ResponseSchema,
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Invalid ID format",
		},
		[StatusCodes.NOT_FOUND]: {
			description: "${pascal} not found",
		},
	},
};

export const create${pascal}OpenAPI = {
	tags: ["${pascal}"],
	summary: "Create a new ${camel}",
	description: "Creates a new ${camel} with the provided data",
	request: {
		body: {
			description: "${pascal} data",
			schema: insert${pascal}JSONSchema,
		},
	},
	responses: {
		[StatusCodes.CREATED]: {
			description: "${pascal} created successfully",
			schema: ${kebab.includes('-') ? 'item' : camel}ResponseSchema,
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Validation error",
		},
		[StatusCodes.CONFLICT]: {
			description: "${pascal} already exists",
		},
	},
};

export const update${pascal}OpenAPI = {
	tags: ["${pascal}"],
	summary: "Update ${camel}",
	description: "Updates an existing ${camel} by ID",
	request: {
		params: [
			{
				name: "id",
				description: "${pascal} ID",
				required: true,
				schema: { type: "integer" },
			},
		],
		body: {
			description: "Updated ${camel} data",
			// TODO: Consider using a partial schema for updates
			schema: insert${pascal}JSONSchema,
		},
	},
	responses: {
		[StatusCodes.OK]: {
			description: "${pascal} updated successfully",
			schema: ${kebab.includes('-') ? 'item' : camel}ResponseSchema,
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Validation error",
		},
		[StatusCodes.NOT_FOUND]: {
			description: "${pascal} not found",
		},
	},
};

export const delete${pascal}OpenAPI = {
	tags: ["${pascal}"],
	summary: "Delete ${camel}",
	description: "Deletes a ${camel} by ID",
	request: {
		params: [
			{
				name: "id",
				description: "${pascal} ID",
				required: true,
				schema: { type: "integer" },
			},
		],
	},
	responses: {
		[StatusCodes.OK]: {
			description: "${pascal} deleted successfully",
			schema: {
				type: "object",
				properties: {
					message: {
						type: "string",
						example: "${pascal} deleted successfully",
					},
				},
			},
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Invalid ID format",
		},
		[StatusCodes.NOT_FOUND]: {
			description: "${pascal} not found",
		},
	},
};`;

export const getRoutesTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { APIBuilder } from "@/server/lib/api-builder";
import { database } from "@/server/middleware/database";
import { insert${pascal}Schema, update${pascal}Schema } from "@/server/schemas/database";
import {
	getAll${pascal},
	get${pascal}ById,
	create${pascal},
	update${pascal},
	delete${pascal},
} from "./${kebab}.handlers";
import {
	getAll${pascal}OpenAPI,
	get${pascal}ByIdOpenAPI,
	create${pascal}OpenAPI,
	update${pascal}OpenAPI,
	delete${pascal}OpenAPI,
} from "./${kebab}.openapi";

export function create${pascal}Module() {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get all ${camel}
	builder.addRoute({
		method: "get",
		path: "/",
		handler: getAll${pascal},
		openapi: getAll${pascal}OpenAPI,
	});

	// Get ${camel} by ID
	builder.addRoute({
		method: "get",
		path: "/:id",
		handler: get${pascal}ById,
		openapi: get${pascal}ByIdOpenAPI,
	});

	// Create new ${camel}
	builder.addRoute({
		method: "post",
		path: "/",
		validation: {
			body: insert${pascal}Schema,
		},
		handler: create${pascal},
		openapi: create${pascal}OpenAPI,
	});

	// Update ${camel}
	builder.addRoute({
		method: "put",
		path: "/:id",
		validation: {
			body: update${pascal}Schema,
		},
		handler: update${pascal},
		openapi: update${pascal}OpenAPI,
	});

	// Delete ${camel}
	builder.addRoute({
		method: "delete",
		path: "/:id",
		handler: delete${pascal},
		openapi: delete${pascal}OpenAPI,
	});

	return builder;
}`;

export const getIndexTemplate = ({
	pascal,
	kebab,
}: NameVariations) => `import type { ModuleDefinition } from "../../core/module-loader";
import { create${pascal}Module } from "./${kebab}.routes";

const ${kebab}Module: ModuleDefinition = {
	name: "${kebab}",
	basePath: "/${kebab}",
	createModule: create${pascal}Module,
	metadata: {
		version: "1.0.0",
		tags: ["${pascal}"],
		// Add security: ["public"] if you want this module to be publicly accessible
	},
};

export default ${kebab}Module;`;

export const getChecklistTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `# ${pascal} Module Integration Checklist

This checklist will guide you through integrating the ${kebab} module into your application.

## ✅ Required Steps

### 1. Create Database Table

Create the file \`/src/server/db/tables/${kebab}.table.ts\`:

\`\`\`typescript
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ${camel} = sqliteTable("${camel}", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // TODO: Add your fields here
  name: text("name").notNull(),
  description: text("description"),
  // Add timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql\`(unixepoch())\`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql\`(unixepoch())\`)
    .\$onUpdate(() => new Date()),
});
\`\`\`

### 2. Export the Table

Add the export to \`/src/server/db/tables/index.ts\`:

\`\`\`typescript
export * from "./${kebab}.table";
\`\`\`

### 3. Create Zod Schemas

Create the file \`/src/server/schemas/database/${kebab}.ts\`:

\`\`\`typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ${camel} } from "../../db/tables/${kebab}.table";

// Create base schemas from the database table
export const select${pascal}Schema = createSelectSchema(${camel});
export const insert${pascal}Schema = createInsertSchema(${camel})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Create update schema (all fields optional)
export const update${pascal}Schema = insert${pascal}Schema.partial();

// You can also define field-specific schemas for reuse
export const ${camel}NameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be 255 characters or less");
\`\`\`

### 4. Export the Schemas

Add the exports to \`/src/server/schemas/database/index.ts\`:

\`\`\`typescript
export {
  insert${pascal}Schema,
  select${pascal}Schema,
  update${pascal}Schema,
} from "./${kebab}";
\`\`\`

### 5. Generate and Apply Migrations

Run these commands in order:

\`\`\`bash
# Generate the migration
bun run db:generate

# Apply to local database
bun run db:push:local

# (Optional) Apply to remote database
bun run db:push:remote
\`\`\`

### 6. Customize Business Logic

Review and update the generated handlers in \`${kebab}.handlers.ts\`:
- Add validation logic
- Implement filtering, pagination, and sorting for the list endpoint
- Add any business-specific logic
- Handle special fields (e.g., price conversions, file uploads)

### 7. Update OpenAPI Documentation

Review \`${kebab}.openapi.ts\` and:
- Add query parameters for list filtering
- Update descriptions to match your business domain
- Consider using partial schemas for updates

### 8. Generate Client Types

\`\`\`bash
bun run gen:api
\`\`\`

### 9. Verify Everything Works

\`\`\`bash
# Check TypeScript types
bun run typecheck

# Start the dev server
bun run dev

# Test the endpoints at http://localhost:5173/api/${kebab}
\`\`\`

## 📝 Optional Steps

### Add Authentication

By default, all routes require authentication. To make routes public:

\`\`\`typescript
// In index.ts, add:
metadata: {
  security: ["public"],
}
\`\`\`

### Add Tests

Create a test file \`${kebab}.test.ts\` following the pattern in \`posts.test.ts\`.

### Add Complex Queries

For filtering, pagination, and sorting, update the \`getAll${pascal}\` handler:

\`\`\`typescript
const { search, sortBy = "createdAt", order = "desc", limit = "50", offset = "0" } = c.req.query();

let query = db.select().from(${camel});

if (search) {
  query = query.where(like(${camel}.name, \`%\${search}%\`));
}

query = query
  .orderBy(order === "asc" ? asc(${camel}[sortBy]) : desc(${camel}[sortBy]))
  .limit(parseInt(limit))
  .offset(parseInt(offset));

const results = await query;
\`\`\`

## 🚨 Common Issues

1. **Import errors**: Make sure all imports use the correct paths
2. **Type errors**: Run \`bun run typecheck\` to catch issues early
3. **Schema mismatch**: Ensure your Zod schemas match your database schema
4. **API generation fails**: This might be due to Zod v4 limitations - the API will still work

## 🎉 Done!

Your ${kebab} module is now ready to use at \`/api/${kebab}\`!
`;

// Remove the test template since we won't generate test files
export const getTestTemplate = null;