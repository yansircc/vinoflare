import type { NameVariations } from "../utils";

export const getTestTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ModuleRegistry } from "@/server/db/modular";
import { createTestApp } from "@/server/tests/test-helpers";
import ${camel}Module from "../index";
import type { Select${pascal} } from "../${kebab}.schema";
import {
	createTest${pascal},
	reset${pascal}TestData,
} from "./${kebab}.test-utils";

describe("${pascal} Module", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(async () => {
		// Register module for database middleware
		ModuleRegistry.register([${camel}Module]);

		// Create test app
		app = createTestApp([${camel}Module], env);
	});

	beforeEach(async () => {
		// TODO: Add test data cleanup when DB is available
		reset${pascal}TestData();
	});

	it("should create a ${camel}", async () => {
		const ${camel}Data = createTest${pascal}({ /* your fields here */ });
		const request = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			body: JSON.stringify(${camel}Data),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const response = await app.request(request);
		expect(response.status).toBe(201);
		const json = await response.json() as { ${camel}: Select${pascal} };
		// Add your assertions here
		expect(json.${camel}).toBeDefined();
		expect(json.${camel}.name).toBe(${camel}Data.name);
	});

	it("should get a ${camel} by ID", async () => {
		// Create a ${camel} first
		const createReq = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			body: JSON.stringify(createTest${pascal}()),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const createResponse = await app.request(createReq);
		const { ${camel} } = await createResponse.json() as { ${camel}: Select${pascal} };

		// Get the ${camel}
		const getReq = new Request(\`http://localhost/api/${kebab}/\${${camel}.id}\`);
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should get all ${camel}", async () => {
		// Create a ${camel} first
		const createReq = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			body: JSON.stringify(createTest${pascal}()),
			headers: {
				"Content-Type": "application/json",
			},
		});
		await app.request(createReq);

		const getReq = new Request("http://localhost/api/${kebab}");
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should validate required fields", async () => {
		const request = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			body: JSON.stringify({}), // Empty body
			headers: {
				"Content-Type": "application/json",
			},
		});

		const response = await app.request(request);
		expect(response.status).toBe(400);
	});
});`;