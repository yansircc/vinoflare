import type { NameVariations } from "../utils";

export const getOpenAPITemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";
import {
	insert${pascal}Schema,
	select${pascal}Schema,
} from "./${kebab}.schema";

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
}`;