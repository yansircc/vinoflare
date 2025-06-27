import type { NameVariations } from "../utils";

export const getHandlersTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { ${camel} } from "./${kebab}.table";
import type { BaseContext } from "@/server/lib/types";
import type { Insert${pascal} } from "./${kebab}.types";
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
	const data = await c.req.json() as Insert${pascal};

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