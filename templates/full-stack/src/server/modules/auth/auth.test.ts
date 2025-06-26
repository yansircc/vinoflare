/**
 * @vitest-environment workers
 */

import { describe, expect, it } from "vitest";
import app from "../../../index";

describe("Auth API", () => {
	// Test for accessing /user without authentication
	it("should return 401 Unauthorized when getting user without a session", async () => {
		const res = await app.request("/api/auth/user", {}, { env: { DB: {} } });
		expect(res.status).toBe(401);
	});

	// Note: A full end-to-end test for the OAuth flow is complex and typically
	// requires a mock identity provider. This test focuses on the application's
	// direct handling of the user endpoint.
});
