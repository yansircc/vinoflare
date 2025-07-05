import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { createTestApp } from "@/server/tests/test-helpers";
import authModule from "../index";

describe("Auth API", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(() => {
		app = createTestApp([authModule], env);
	});

	// Test for accessing /user - in test environment, a test user is automatically set
	it("should return test user when accessing /api/auth/user in test environment", async () => {
		const res = await app.request("/api/auth/user");
		expect(res.status).toBe(200);
		const json = (await res.json()) as { user: { id: string; email: string } };
		expect(json).toHaveProperty("user");
		expect(json.user).toHaveProperty("id", "test-user-id");
		expect(json.user).toHaveProperty("email", "test@example.com");
	});

	// Note: A full end-to-end test for the OAuth flow is complex and typically
	// requires a mock identity provider. This test focuses on the application's
	// direct handling of the user endpoint.
});
