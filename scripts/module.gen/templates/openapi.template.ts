import type { NameVariations } from "../utils";

export const getOpenAPITemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { createOpenAPISpec, createCRUDOpenAPISpecs } from "@/server/lib/openapi-builder";
import { z } from "zod/v4";
import {
	insert${pascal}Schema,
	select${pascal}Schema,
} from "./${kebab}.schema";

// 将 Zod schemas 转换为 JSON Schema
// 注意：如果 z.toJSONSchema 出现兼容性问题，可以手动定义 schema
const ${camel}Schema = z.toJSONSchema(select${pascal}Schema);
const insert${pascal}JSONSchema = z.toJSONSchema(insert${pascal}Schema);

// 使用 CRUD 构建器生成标准的 CRUD OpenAPI 定义
const crudSpecs = createCRUDOpenAPISpecs({
	entity: "${pascal}",
	schemas: {
		select: ${camel}Schema,
		insert: insert${pascal}JSONSchema,
	},
	responseWrapper: "${camel}",
});

// 导出标准 CRUD 操作的 OpenAPI 定义
export const getAll${pascal}OpenAPI = crudSpecs.list;
export const get${pascal}ByIdOpenAPI = crudSpecs.getById;
export const create${pascal}OpenAPI = crudSpecs.create;
export const update${pascal}OpenAPI = crudSpecs.update;
export const delete${pascal}OpenAPI = crudSpecs.delete;

// 如果需要自定义某个操作，可以覆盖或添加额外的定义
// 例如：
// export const get${pascal}BySlugOpenAPI = createOpenAPISpec({
//   operation: "Get ${camel} by slug",
//   entity: "${pascal}",
//   action: "get",
//   responseSchema: ${camel}Schema,
//   responseWrapper: "${camel}",
//   params: [
//     {
//       name: "slug",
//       description: "${pascal} URL slug",
//       required: true,
//       schema: { type: "string", pattern: "^[a-z0-9-]+$" },
//     },
//   ],
// });

// 原始定义（保留以供参考，实际使用上面的 CRUD 构建器）
/*
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
*/

/*
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
*/

/*
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
*/

/*
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
*/

/*
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
};
*/`;