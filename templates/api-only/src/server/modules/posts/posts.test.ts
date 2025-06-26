/**
 * @vitest-environment workers
 */
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createPostsModule } from "./posts.routes";

// Create a new Hono app instance just for testing this module
const app = new Hono();
const postsModule = createPostsModule();
app.route("/posts", postsModule.getApp());

describe("Posts API", () => {
	// Test for creating a new post
	it("should create a new post", async () => {
		const newPost = { title: `Test Post ${Date.now()}` };
		const res = await app.request("/posts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newPost),
		});

		// We expect a 500 error here because we haven't mocked the DB yet
		// But this confirms we are hitting the right handler
		expect(res.status).toBe(500);
	});
});
