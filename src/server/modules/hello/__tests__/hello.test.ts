import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { createTestApp } from "@/server/tests/test-helpers";
import helloModule from "../index";

describe("Hello Module", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(() => {
		app = createTestApp([helloModule], env);
	});

	describe("GET /api/hello", () => {
		it("should return a greeting message with timestamp", async () => {
			const response = await app.request("/api/hello");

			expect(response.status).toBe(200);
			const json = await response.json();
			expect(json).toHaveProperty("message");
			expect(json).toHaveProperty("time");
		});
	});
});
