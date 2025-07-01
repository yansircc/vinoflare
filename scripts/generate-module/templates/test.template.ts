import type { NameVariations } from "../utils";

export const getTestTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp } from "@/server/tests/test-helpers";
import ${camel}Module from "../index";
import type { ${pascal} } from "../${kebab}.schema";
import {
	createTest${pascal},
	reset${pascal}TestData,
} from "./${kebab}.test-utils";

describe("${pascal} Module", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(async () => {
		// Create test app
		app = createTestApp([${camel}Module], env);
	});

	beforeEach(async () => {
		// Reset test data before each test
		reset${pascal}TestData();
	});

	it("should create a ${camel}", async () => {
		const ${camel}Data = createTest${pascal}();
		const request = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(${camel}Data),
		});

		const response = await app.request(request);
		expect(response.status).toBe(201);
		const json = await response.json() as { ${camel}: ${pascal} };
		expect(json.${camel}).toBeDefined();
		expect(json.${camel}.name).toBe(${camel}Data.name);
	});

	it("should get a ${camel} by ID", async () => {
		// Create a ${camel} first
		const createReq = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(createTest${pascal}()),
		});
		const createResponse = await app.request(createReq);
		const { ${camel} } = await createResponse.json() as { ${camel}: ${pascal} };

		// Get the ${camel}
		const getReq = new Request(\`http://localhost/api/${kebab}/\${${camel}.id}\`);
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
		const getJson = await response.json() as { ${camel}: ${pascal} };
		expect(getJson.${camel}.id).toBe(${camel}.id);
	});

	it("should get all ${camel}s", async () => {
		// Create a ${camel} first
		const createReq = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(createTest${pascal}()),
		});
		await app.request(createReq);

		const getReq = new Request("http://localhost/api/${kebab}");
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
		const json = await response.json() as { ${camel}s: ${pascal}[] };
		expect(json.${camel}s).toBeDefined();
		expect(Array.isArray(json.${camel}s)).toBe(true);
	});

	it("should validate required fields", async () => {
		const request = new Request("http://localhost/api/${kebab}", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}), // Empty body
		});

		const response = await app.request(request);
		expect(response.status).toBe(400);
	});
});`;