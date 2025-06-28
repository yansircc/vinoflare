import { z } from "zod/v4";
import { createOpenAPISpec } from "@/server/lib/openapi-builder";
import { helloResponseSchema } from "./hello.schema";

const helloResponseJSONSchema = z.toJSONSchema(helloResponseSchema);

// 使用构建器创建 OpenAPI 定义
export const helloOpenAPI = createOpenAPISpec({
	operation: "Hello endpoint",
	entity: "Greeting",
	action: "get",
	responseSchema: helloResponseJSONSchema,
	skipStandardErrors: true, // Hello 端点不需要标准错误响应
});
