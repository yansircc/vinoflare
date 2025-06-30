import type { NameVariations } from "../utils";

export const getTestTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `/**
 * @vitest-environment workers
 */

import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ModuleRegistry } from "@/server/db/modular";
import { createTestApp } from "@/server/tests/test-helpers";
import { createAuthRequest } from "@/server/tests/auth-utils";
import ${camel}Module from "../index";
import type { Select${pascal} } from "../${kebab}.schema";
import {
	clean${pascal}Data,
	createTest${pascal},
	reset${pascal}TestData,
	setup${pascal}Table,
} from "./${kebab}.test-utils";

describe("${pascal} Module", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(async () => {
		// Register module for database middleware
		ModuleRegistry.register([${camel}Module]);

		// Create test app
		app = createTestApp([${camel}Module], env);

		// Setup ${camel} table
		await setup${pascal}Table(env.DB);
	});

	beforeEach(async () => {
		await clean${pascal}Data(env.DB);
		reset${pascal}TestData();
	});

	it("should create a ${camel}", async () => {
		const ${camel}Data = createTest${pascal}({ /* your fields here */ });
		const request = await createAuthRequest("/api/${kebab}", {
			method: "POST",
			body: JSON.stringify(${camel}Data),
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
		const createReq = await createAuthRequest("/api/${kebab}", {
			method: "POST",
			body: JSON.stringify(createTest${pascal}()),
		});
		const createResponse = await app.request(createReq);
		const { ${camel} } = await createResponse.json() as { ${camel}: Select${pascal} };

		// Get the ${camel}
		const getReq = await createAuthRequest(\`/api/${kebab}/\${${camel}.id}\`);
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should get all ${camel}", async () => {
		// Create a ${camel} first
		const createReq = await createAuthRequest("/api/${kebab}", {
			method: "POST",
			body: JSON.stringify(createTest${pascal}()),
		});
		await app.request(createReq);

		const getReq = await createAuthRequest("/api/${kebab}");
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should validate required fields", async () => {
		const request = await createAuthRequest("/api/${kebab}", {
			method: "POST",
			body: JSON.stringify({}), // Empty body
		});

		const response = await app.request(request);
		expect(response.status).toBe(400);
	});
});`;