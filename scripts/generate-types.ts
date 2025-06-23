// 从 OpenAPI 规范生成 TypeScript 类型
import { writeFileSync } from "fs";
import { app } from "../src/index";

async function generateTypes() {
  // 获取 OpenAPI 文档
  const response = await app.request("/doc");
  const openApiSpec = await response.json();

  // 生成类型定义
  let typeDefinitions = `// Auto-generated API types from OpenAPI spec
// Generated at: ${new Date().toISOString()}

`;

  // 从 OpenAPI paths 生成类型
  for (const [path, methods] of Object.entries(openApiSpec.paths || {})) {
    for (const [method, operation] of Object.entries(methods as any)) {
      if (typeof operation !== "object") continue;

      const operationId = operation.operationId || `${method}_${path.replace(/[{}\/]/g, "_")}`;
      
      // 生成响应类型
      if (operation.responses?.["200"]?.content?.["application/json"]?.schema) {
        typeDefinitions += `export type ${operationId}Response = ${JSON.stringify(
          operation.responses["200"].content["application/json"].schema,
          null,
          2
        )};\n\n`;
      }

      // 生成请求类型
      if (operation.requestBody?.content?.["application/json"]?.schema) {
        typeDefinitions += `export type ${operationId}Request = ${JSON.stringify(
          operation.requestBody.content["application/json"].schema,
          null,
          2
        )};\n\n`;
      }
    }
  }

  // 写入文件
  writeFileSync(
    "./src/lib/api-generated-types.ts",
    typeDefinitions
  );

  console.log("✅ API types generated successfully!");
}

generateTypes().catch(console.error);