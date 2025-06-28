import { StatusCodes } from "http-status-codes";

type HttpMethod = "get" | "create" | "update" | "delete" | "list";

/**
 * 清理 JSON Schema，移除 z.toJSONSchema 添加的额外字段
 * 并修复 OpenAPI 3.0 兼容性问题
 */
function cleanJSONSchema(schema: any): any {
	if (!schema || typeof schema !== 'object') {
		return schema;
	}
	
	// 创建副本以避免修改原始对象
	const cleaned = { ...schema };
	
	// 移除 $schema 字段
	delete cleaned.$schema;
	
	// 修复 exclusiveMinimum 和 exclusiveMaximum
	// OpenAPI 3.0 中这些应该是布尔值，而不是数字
	if (typeof cleaned.exclusiveMinimum === 'number') {
		cleaned.minimum = cleaned.exclusiveMinimum;
		cleaned.exclusiveMinimum = true;
	}
	if (typeof cleaned.exclusiveMaximum === 'number') {
		cleaned.maximum = cleaned.exclusiveMaximum;
		cleaned.exclusiveMaximum = true;
	}
	
	// 递归清理嵌套的 schema
	if (cleaned.properties) {
		cleaned.properties = Object.fromEntries(
			Object.entries(cleaned.properties).map(([key, value]) => [
				key,
				cleanJSONSchema(value),
			])
		);
	}
	
	if (cleaned.items) {
		cleaned.items = cleanJSONSchema(cleaned.items);
	}
	
	// 处理 anyOf, oneOf, allOf
	['anyOf', 'oneOf', 'allOf'].forEach(key => {
		if (Array.isArray(cleaned[key])) {
			cleaned[key] = cleaned[key].map((s: any) => cleanJSONSchema(s));
		}
	});
	
	return cleaned;
}

interface OpenAPIConfig {
	operation: string;
	entity: string;
	action: HttpMethod;
	requestSchema?: any;
	responseSchema?: any;
	responseWrapper?: string; // 例如 'post', 'posts', 'user' 等
	params?: Array<{
		name: string;
		description: string;
		required?: boolean;
		schema?: any;
	}>;
	additionalResponses?: Record<number, { description: string; schema?: any }>;
	skipStandardErrors?: boolean;
}

/**
 * 创建 OpenAPI 规范的辅助函数
 * 减少重复代码，确保一致性
 */
export function createOpenAPISpec(config: OpenAPIConfig) {
	const {
		operation,
		entity,
		action,
		requestSchema,
		responseSchema,
		responseWrapper,
		params,
		additionalResponses = {},
		skipStandardErrors = false,
	} = config;

	// 实体名称格式化
	const entityLower = entity.toLowerCase();
	const entityCapitalized = entity.charAt(0).toUpperCase() + entity.slice(1);

	// 动作描述映射
	const actionDescriptions = {
		get: `Retrieves a specific ${entityLower}`,
		list: `Retrieves all ${entityLower}s`,
		create: `Creates a new ${entityLower}`,
		update: `Updates an existing ${entityLower}`,
		delete: `Deletes a ${entityLower}`,
	};

	// 成功响应描述
	const successDescriptions = {
		get: `${entityCapitalized} retrieved successfully`,
		list: `${entityCapitalized} list retrieved successfully`,
		create: `${entityCapitalized} created successfully`,
		update: `${entityCapitalized} updated successfully`,
		delete: `${entityCapitalized} deleted successfully`,
	};

	// 响应状态码
	const successStatus =
		action === "create" ? StatusCodes.CREATED : StatusCodes.OK;

	// 清理 schema（移除 $schema 等字段）
	const cleanedResponseSchema = responseSchema ? cleanJSONSchema(responseSchema) : undefined;
	const cleanedRequestSchema = requestSchema ? cleanJSONSchema(requestSchema) : undefined;
	
	// 构建响应 schema
	let finalResponseSchema = cleanedResponseSchema;
	if (responseWrapper && cleanedResponseSchema) {
		finalResponseSchema = {
			type: "object",
			properties: {
				[responseWrapper]:
					action === "list"
						? { type: "array", items: cleanedResponseSchema }
						: cleanedResponseSchema,
			},
			required: [responseWrapper],
		};
	}

	// 构建基础规范
	const spec: any = {
		tags: [entityCapitalized],
		summary: operation,
		description: actionDescriptions[action] || operation,
		responses: {
			[successStatus]: {
				description: successDescriptions[action],
				...(finalResponseSchema && { schema: finalResponseSchema }),
			},
			...additionalResponses,
		},
	};

	// 添加请求参数
	if (params && params.length > 0) {
		// 清理参数的 schema
		const cleanedParams = params.map(param => ({
			...param,
			schema: param.schema ? cleanJSONSchema(param.schema) : param.schema
		}));
		spec.request = { params: cleanedParams };
	}

	// 添加请求体
	if (cleanedRequestSchema) {
		spec.request = {
			...spec.request,
			body: {
				description: `${entityCapitalized} data`,
				schema: cleanedRequestSchema,
			},
		};
	}

	// 添加标准错误响应
	if (!skipStandardErrors) {
		// 验证错误（对于有请求体的操作）
		if (cleanedRequestSchema || action === "update") {
			spec.responses[StatusCodes.BAD_REQUEST] = {
				description: "Validation error",
			};
		}

		// 未找到错误（对于需要 ID 的操作）
		if (
			["get", "update", "delete"].includes(action) &&
			params?.some((p) => p.name === "id")
		) {
			spec.responses[StatusCodes.NOT_FOUND] = {
				description: `${entityCapitalized} not found`,
			};
		}

		// 冲突错误（对于创建操作）
		if (action === "create") {
			spec.responses[StatusCodes.CONFLICT] = {
				description: `${entityCapitalized} already exists`,
			};
		}

		// 服务器错误
		spec.responses[StatusCodes.INTERNAL_SERVER_ERROR] = {
			description: "Internal server error",
		};
	}

	return spec;
}

/**
 * 创建标准 CRUD OpenAPI 定义集合
 */
export function createCRUDOpenAPISpecs(config: {
	entity: string;
	schemas: {
		select: any;
		insert: any;
		update?: any;
	};
	responseWrapper?: string;
}) {
	const { entity, schemas, responseWrapper = entity.toLowerCase() } = config;

	return {
		list: createOpenAPISpec({
			operation: `Get all ${entity.toLowerCase()}s`,
			entity,
			action: "list",
			responseSchema: schemas.select,
			responseWrapper: `${responseWrapper}s`, // 复数形式
		}),

		getById: createOpenAPISpec({
			operation: `Get ${entity.toLowerCase()} by ID`,
			entity,
			action: "get",
			responseSchema: schemas.select,
			responseWrapper,
			params: [
				{
					name: "id",
					description: `${entity} ID`,
					required: true,
					schema: { type: "integer" },
				},
			],
		}),

		create: createOpenAPISpec({
			operation: `Create a new ${entity.toLowerCase()}`,
			entity,
			action: "create",
			requestSchema: schemas.insert,
			responseSchema: schemas.select,
			responseWrapper,
		}),

		update: createOpenAPISpec({
			operation: `Update ${entity.toLowerCase()}`,
			entity,
			action: "update",
			requestSchema: schemas.update || schemas.insert,
			responseSchema: schemas.select,
			responseWrapper,
			params: [
				{
					name: "id",
					description: `${entity} ID`,
					required: true,
					schema: { type: "integer" },
				},
			],
		}),

		delete: createOpenAPISpec({
			operation: `Delete ${entity.toLowerCase()}`,
			entity,
			action: "delete",
			params: [
				{
					name: "id",
					description: `${entity} ID`,
					required: true,
					schema: { type: "integer" },
				},
			],
			responseSchema: {
				type: "object",
				properties: {
					message: {
						type: "string",
						example: `${entity} deleted successfully`,
					},
				},
			},
		}),
	};
}
