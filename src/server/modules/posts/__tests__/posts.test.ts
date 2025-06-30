/**
 * @vitest-environment workers
 */

import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ModuleRegistry } from "@/server/db/modular";
import { createAuthRequest } from "@/server/tests/auth-utils";
import { createTestApp } from "@/server/tests/test-helpers";
import postsModule from "../index";
import {
	cleanPostsData,
	createTestPost,
	resetPostsTestData,
	setupPostsTable,
} from "./posts.test-utils";

describe("Posts Module", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(async () => {
		// Register module for database middleware
		ModuleRegistry.register([postsModule]);

		// Create test app
		app = createTestApp([postsModule], env);

		// Setup posts table
		await setupPostsTable(env.DB);
	});

	beforeEach(async () => {
		await cleanPostsData(env.DB);
		resetPostsTestData();
	});

	it("should create a post", async () => {
		const postData = createTestPost({ title: "Test Post" });
		const request = await createAuthRequest("/api/posts", {
			method: "POST",
			body: JSON.stringify(postData),
		});

		const response = await app.request(request);
		expect(response.status).toBe(201);
		const json = (await response.json()) as { post: any };
		expect(json.post.title).toBe("Test Post");
	});

	it("should get a post by ID", async () => {
		// Create a post first
		const createReq = await createAuthRequest("/api/posts", {
			method: "POST",
			body: JSON.stringify(createTestPost()),
		});
		const createResponse = await app.request(createReq);
		const { post } = (await createResponse.json()) as { post: any };

		// Get the post
		const getReq = await createAuthRequest(`/api/posts/${post.id}`);
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should get latest post", async () => {
		// Create a post first
		const createReq = await createAuthRequest("/api/posts", {
			method: "POST",
			body: JSON.stringify(createTestPost()),
		});
		await app.request(createReq);

		const getReq = await createAuthRequest("/api/posts/latest");
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should validate empty title", async () => {
		const request = await createAuthRequest("/api/posts", {
			method: "POST",
			body: JSON.stringify({ title: "" }),
		});

		const response = await app.request(request);
		expect(response.status).toBe(400);
	});
});
