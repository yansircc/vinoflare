import { z } from "zod/v4";
import { createOpenAPISpec } from "@/server/lib/openapi-builder";
import {
	insertPostSchema,
	postIdSchema,
	selectPostSchema,
} from "./posts.schema";

const postJSONSchema = z.toJSONSchema(selectPostSchema);
const insertPostJSONSchema = z.toJSONSchema(insertPostSchema);
const postIdJSONSchema = z.toJSONSchema(postIdSchema);

// 使用构建器创建 OpenAPI 定义
export const getLatestPostOpenAPI = createOpenAPISpec({
	operation: "Get latest post",
	entity: "Post",
	action: "get",
	responseSchema: postJSONSchema,
	responseWrapper: "post",
	skipStandardErrors: false,
	additionalResponses: {}, // 使用标准错误响应
});

export const createPostOpenAPI = createOpenAPISpec({
	operation: "Create a new post",
	entity: "Post",
	action: "create",
	requestSchema: insertPostJSONSchema,
	responseSchema: postJSONSchema,
	responseWrapper: "post",
});

export const getPostByIdOpenAPI = createOpenAPISpec({
	operation: "Get post by ID",
	entity: "Post",
	action: "get",
	responseSchema: postJSONSchema,
	responseWrapper: "post",
	params: [
		{
			name: "id",
			description: "Post ID",
			required: true,
			schema: postIdJSONSchema,
		},
	],
});
