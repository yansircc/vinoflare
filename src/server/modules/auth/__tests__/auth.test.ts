/**
 * @vitest-environment workers
 */

import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { createTestApp } from "@/server/tests/test-helpers";
import authModule from "../index";

describe("Auth API", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(() => {
		app = createTestApp([authModule], env);
	});

	// Test for accessing /user without authentication
	it("should return 401 Unauthorized when getting user without a session", async () => {
		const res = await app.request("/api/auth/user");
		expect(res.status).toBe(401);
	});

	// Note: A full end-to-end test for the OAuth flow is complex and typically
	// requires a mock identity provider. This test focuses on the application's
	// direct handling of the user endpoint.
});
