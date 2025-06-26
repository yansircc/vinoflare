import type { NameVariations } from "./utils";

export const getHandlersTemplate = ({
	pascal,
	camel,
	schema,
}: NameVariations & { schema: string }) => `import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { ${schema} } from "@/server/db";
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
	const ${camel}List = await db.select().from(${schema});
	return c.json({ ${camel}: ${camel}List });
}

/**
 * Get ${camel} by ID
 */
export async function get${pascal}ById(c: Context<BaseContext>) {
	const id = Number(c.req.param("id"));
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	const result = await db
		.select()
		.from(${schema})
		.where(eq(${schema}.id, id))
		.limit(1);

	if (!result[0]) {
		throw new NotFoundError("${pascal}");
	}

	return c.json({ ${camel}: result[0] });
}

/**
 * Create a new ${camel}
 */
export async function create${pascal}(c: Context<BaseContext>) {
	const data = c.req.valid("json");

	try {
		const [new${pascal}] = await db
			.insert(${schema})
			.values(data)
			.returning();

		return c.json({ ${camel}: new${pascal} }, 201);
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
	const id = Number(c.req.param("id"));
	const data = c.req.valid("json");
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	const [updated${pascal}] = await db
		.update(${schema})
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(${schema}.id, id))
		.returning();

	if (!updated${pascal}) {
		throw new NotFoundError("${pascal}");
	}

	return c.json({ ${camel}: updated${pascal} });
}

/**
 * Delete ${camel} by ID
 */
export async function delete${pascal}(c: Context<BaseContext>) {
	const id = Number(c.req.param("id"));
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	const [deleted${pascal}] = await db
		.delete(${schema})
		.where(eq(${schema}.id, id))
		.returning();

	if (!deleted${pascal}) {
		throw new NotFoundError("${pascal}");
	}

	return c.json({ message: "${pascal} deleted successfully" });
}`;

export const getOpenAPITemplate = ({
	pascal,
	camel,
}: NameVariations) => `import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";
import { insert${pascal}Schema, select${pascal}Schema } from "@/server/db";

const ${camel}Schema = z.toJSONSchema(select${pascal}Schema);
const insert${pascal}JSONSchema = z.toJSONSchema(insert${pascal}Schema);

// Response wrapper schemas
const ${camel}ResponseSchema = {
	type: "object",
	properties: {
		${camel}: ${camel}Schema,
	},
	required: ["${camel}"],
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
			schema: ${camel}ResponseSchema,
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
			schema: ${camel}ResponseSchema,
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
			schema: insert${pascal}JSONSchema,
		},
	},
	responses: {
		[StatusCodes.OK]: {
			description: "${pascal} updated successfully",
			schema: ${camel}ResponseSchema,
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
import type { BaseContext } from "@/server/lib/types";
import { insert${pascal}Schema } from "@/server/db";
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
	return new APIBuilder<BaseContext>()
		// Get all ${camel}
		.get("/", getAll${pascal}, getAll${pascal}OpenAPI)
		// Get ${camel} by ID
		.get("/:id", get${pascal}ById, get${pascal}ByIdOpenAPI)
		// Create new ${camel}
		.post(
			"/",
			create${pascal},
			create${pascal}OpenAPI,
			insert${pascal}Schema,
		)
		// Update ${camel}
		.put(
			"/:id",
			update${pascal},
			update${pascal}OpenAPI,
			insert${pascal}Schema,
		)
		// Delete ${camel}
		.delete("/:id", delete${pascal}, delete${pascal}OpenAPI);
}`;

export const getTestTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `/**
 * @vitest-environment workers
 */
import { beforeAll, describe, expect, it } from "vitest";
import { testClient } from "@/test/test-client";
import type { Insert${pascal} } from "@/server/db";

describe("${pascal} API", () => {
	let created${pascal}Id: number;

	const test${pascal}: Insert${pascal} = {
		// TODO: Add your test data here
		// Example: name: "Test ${pascal}",
	};

	beforeAll(async () => {
		// TODO: Setup test data if needed
	});

	describe("POST /${kebab}", () => {
		it("should create a new ${camel}", async () => {
			const response = await testClient.${kebab}.\$post({
				json: test${pascal},
			});

			expect(response.status).toBe(201);
			const data = await response.json();
			expect(data.${camel}).toBeDefined();
			expect(data.${camel}.id).toBeDefined();
			created${pascal}Id = data.${camel}.id;
		});

		it("should return 400 for invalid data", async () => {
			const response = await testClient.${kebab}.\$post({
				json: {},
			});

			expect(response.status).toBe(400);
		});
	});

	describe("GET /${kebab}", () => {
		it("should return all ${camel}", async () => {
			const response = await testClient.${kebab}.\$get();

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(Array.isArray(data.${camel})).toBe(true);
			expect(data.${camel}.length).toBeGreaterThan(0);
		});
	});

	describe("GET /${kebab}/:id", () => {
		it("should return a specific ${camel}", async () => {
			const response = await testClient.${kebab}[":id"].\$get({
				param: { id: created${pascal}Id.toString() },
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.${camel}).toBeDefined();
			expect(data.${camel}.id).toBe(created${pascal}Id);
		});

		it("should return 404 for non-existent ${camel}", async () => {
			const response = await testClient.${kebab}[":id"].\$get({
				param: { id: "999999" },
			});

			expect(response.status).toBe(404);
		});
	});

	describe("PUT /${kebab}/:id", () => {
		it("should update an existing ${camel}", async () => {
			const updatedData = {
				...test${pascal},
				// TODO: Add updated fields
			};

			const response = await testClient.${kebab}[":id"].\$put({
				param: { id: created${pascal}Id.toString() },
				json: updatedData,
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.${camel}).toBeDefined();
			// TODO: Add assertions for updated fields
		});

		it("should return 404 for non-existent ${camel}", async () => {
			const response = await testClient.${kebab}[":id"].\$put({
				param: { id: "999999" },
				json: test${pascal},
			});

			expect(response.status).toBe(404);
		});
	});

	describe("DELETE /${kebab}/:id", () => {
		it("should delete an existing ${camel}", async () => {
			const response = await testClient.${kebab}[":id"].\$delete({
				param: { id: created${pascal}Id.toString() },
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.message).toBe("${pascal} deleted successfully");
		});

		it("should return 404 for non-existent ${camel}", async () => {
			const response = await testClient.${kebab}[":id"].\$delete({
				param: { id: "999999" },
			});

			expect(response.status).toBe(404);
		});
	});
});`;
