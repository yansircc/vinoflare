import type { NameVariations } from "../utils";

export const getRoutesTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import { eq, sql, desc } from "drizzle-orm";
import { createAPI, response, commonErrors } from "@/server/core/api";
import {
	select${pascal}Schema,
	insert${pascal}Schema,
	update${pascal}Schema,
} from "./${kebab}.schema";
import { ${camel} } from "./${kebab}.table";

/**
 * ${pascal} API routes
 */
export function create${pascal}Routes() {
	return createAPI()
		.tags("${pascal}")
		
		// List all ${camel}s
		.get("/", {
			summary: "Get all ${camel}s",
			description: "Retrieve a paginated list of ${camel}s",
			query: z.object({
				page: z.coerce.number().positive().default(1),
				limit: z.coerce.number().positive().max(100).default(10),
			}),
			response: z.object({
				${camel}s: z.array(select${pascal}Schema),
				pagination: z.object({
					page: z.number(),
					limit: z.number(),
					total: z.number(),
					totalPages: z.number(),
				}),
			}),
			includeStandardErrors: false,
			errors: commonErrors.public,
			handler: async (c) => {
				const { page, limit } = c.req.valid("query");
				const db = c.get("db");
				
				const offset = (page - 1) * limit;
				
				// Get total count
				const countResult = await db
					.select({ count: sql<number>\`count(*)\` })
					.from(${camel});
				const total = countResult[0]?.count || 0;
				
				// Get paginated results
				const results = await db
					.select()
					.from(${camel})
					.limit(limit)
					.offset(offset)
					.orderBy(desc(${camel}.id));
				
				return c.json({
					${camel}s: results,
					pagination: {
						page,
						limit,
						total,
						totalPages: Math.ceil(total / limit),
					},
				});
			},
		})
		
		// Get ${camel} by ID
		.get("/:id", {
			summary: "Get ${camel} by ID",
			description: "Retrieve a single ${camel} by its ID",
			params: z.object({ id: z.coerce.number().positive() }),
			response: response("${camel}", select${pascal}Schema),
			includeStandardErrors: false,
			errors: commonErrors.crud,
			handler: async (c) => {
				const id = Number(c.req.param("id"));
				const db = c.get("db");
				
				const result = await db
					.select()
					.from(${camel})
					.where(eq(${camel}.id, id))
					.limit(1);
				
				if (!result[0]) {
					throw new HTTPException(404, {
						message: "${pascal} not found",
					});
				}
				
				return c.json({ ${camel}: result[0] });
			},
		})
		
		// Create new ${camel}
		.post("/", {
			summary: "Create a new ${camel}",
			description: "Create a new ${camel}",
			body: insert${pascal}Schema,
			response: response("${camel}", select${pascal}Schema),
			status: 201,
			includeStandardErrors: false,
			errors: commonErrors.crud,
			handler: async (c) => {
				const data = c.req.valid("json");
				const db = c.get("db");
				
				// TODO: Add custom validation logic here
				
				const [new${pascal}] = await db
					.insert(${camel})
					.values(data)
					.returning();
				
				return c.json({ ${camel}: new${pascal} }, 201);
			},
		})
		
		// Update ${camel}
		.put("/:id", {
			summary: "Update ${camel}",
			description: "Update an existing ${camel}",
			params: z.object({ id: z.coerce.number().positive() }),
			body: update${pascal}Schema,
			response: response("${camel}", select${pascal}Schema),
			includeStandardErrors: false,
			errors: commonErrors.crud,
			handler: async (c) => {
				const id = Number(c.req.param("id"));
				const data = c.req.valid("json");
				const db = c.get("db");
				
				const [updated${pascal}] = await db
					.update(${camel})
					.set(data)
					.where(eq(${camel}.id, id))
					.returning();
				
				if (!updated${pascal}) {
					throw new HTTPException(404, {
						message: "${pascal} not found",
					});
				}
				
				return c.json({ ${camel}: updated${pascal} });
			},
		})
		
		// Delete ${camel}
		.delete("/:id", {
			summary: "Delete ${camel}",
			description: "Delete a ${camel} by its ID",
			params: z.object({ id: z.coerce.number().positive() }),
			response: undefined,
			status: 204,
			includeStandardErrors: false,
			errors: {
				404: "${pascal} not found",
				500: "Failed to delete ${camel}",
			},
			handler: async (c) => {
				const id = Number(c.req.param("id"));
				const db = c.get("db");
				
				const [deleted${pascal}] = await db
					.delete(${camel})
					.where(eq(${camel}.id, id))
					.returning();
				
				if (!deleted${pascal}) {
					throw new HTTPException(404, {
						message: "${pascal} not found",
					});
				}
				
				return c.body(null, 204);
			},
		})
		
		.build();
}`;