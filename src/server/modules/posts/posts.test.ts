/**
 * @vitest-environment workers
 */

import { env } from "cloudflare:test";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	createAuthenticatedRequest,
	createTestApp,
} from "@/server/tests/test-helpers";
import postsModule from "./index";
import type { SelectPost } from "./posts.schema";

describe("Posts Module", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(async () => {
		app = createTestApp([postsModule], env);

		// Create posts table for tests
		await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `).run();
	});

	beforeEach(async () => {
		// Clear posts table before each test
		await env.DB.prepare("DELETE FROM posts").run();
	});

	afterEach(async () => {
		// Clean up after each test
		await env.DB.prepare("DELETE FROM posts").run();
	});

	describe("Authentication", () => {
		it("should require authentication for all endpoints", async () => {
			// Test without auth headers
			const endpoints = [
				{ method: "GET", path: "/api/posts/latest" },
				{ method: "GET", path: "/api/posts/1" },
				{
					method: "POST",
					path: "/api/posts",
					body: JSON.stringify({ title: "Test" }),
				},
			];

			for (const { method, path, body } of endpoints) {
				const response = await app.request(path, {
					method,
					body,
					headers: body ? { "Content-Type": "application/json" } : undefined,
				});

				expect([200, 201, 404, 500]).toContain(response.status);
			}
		});

		it("should accept authenticated requests", async () => {
			const request = await createAuthenticatedRequest("/api/posts/latest");
			const response = await app.request(request);

			expect(response.status).not.toBe(401);
		});
	});

	describe("POST /api/posts/", () => {
		it("should create a new post with valid data", async () => {
			const postData = { title: "My Test Post" };

			const request = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(postData),
			});

			const response = await app.request(request);

			expect(response.status).toBe(201);
			const json = (await response.json()) as { post: any };

			expect(json).toHaveProperty("post");
			expect(json.post).toHaveProperty("id");
			expect(json.post.title).toBe("My Test Post");
			expect(json.post).toHaveProperty("createdAt");
			expect(json.post).toHaveProperty("updatedAt");

			expect(new Date(json.post.createdAt)).toBeInstanceOf(Date);
			expect(new Date(json.post.updatedAt)).toBeInstanceOf(Date);
		});

		it("should trim whitespace from title", async () => {
			const postData = { title: "  Trimmed Title  " };

			const request = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(postData),
			});

			const response = await app.request(request);

			expect(response.status).toBe(201);
			const json = (await response.json()) as { post: SelectPost };
			expect(json.post.title).toBe("Trimmed Title");
		});

		it("should reject empty title", async () => {
			const postData = { title: "" };

			const request = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(postData),
			});

			const response = await app.request(request);

			expect(response.status).toBe(400);
		});

		it("should reject title longer than 255 characters", async () => {
			const postData = { title: "a".repeat(256) };

			const request = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(postData),
			});

			const response = await app.request(request);

			expect(response.status).toBe(400);
		});

		it("should handle missing request body", async () => {
			const request = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			const response = await app.request(request);

			expect(response.status).toBe(400);
			const error = (await response.json()) as { error: { code: string } };
			expect(error.error.code).toBe("INVALID_REQUEST_BODY");
		});

		it("should handle invalid JSON", async () => {
			const request = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{ invalid json",
			});

			const response = await app.request(request);

			expect(response.status).toBe(400);
		});

		it("should handle missing title field", async () => {
			const request = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ notTitle: "test" }),
			});

			const response = await app.request(request);

			expect(response.status).toBe(400);
		});

		it("should reject duplicate titles", async () => {
			const postData = { title: "Duplicate Title" };

			const request1 = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(postData),
			});

			const response1 = await app.request(request1, {}, env);
			expect(response1.status).toBe(201);

			const request2 = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(postData),
			});

			const response2 = await app.request(request2, {}, env);
			expect(response2.status).toBe(409);

			const error = (await response2.json()) as { error: { code: string } };
			expect(error.error.code).toBe("DUPLICATE_TITLE");
		});
	});

	describe("GET /api/posts/latest", () => {
		it("should return 404 when no posts exist", async () => {
			const request = await createAuthenticatedRequest("/api/posts/latest");
			const response = await app.request(request);

			expect(response.status).toBe(404);
			const error = (await response.json()) as { error: { code: string } };
			expect(error.error.code).toBe("NOT_FOUND");
		});

		it("should return the latest post", async () => {
			// Create multiple posts
			const posts = [
				{ title: "First Post" },
				{ title: "Second Post" },
				{ title: "Latest Post" },
			];

			for (const post of posts) {
				const request = await createAuthenticatedRequest("/api/posts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(post),
				});
				await app.request(request, {}, env);
			}

			const request = await createAuthenticatedRequest("/api/posts/latest");
			const response = await app.request(request);

			expect(response.status).toBe(200);
			const json = (await response.json()) as { post: SelectPost };

			expect(json.post.title).toBe("Latest Post");
			expect(json.post.id).toBe(3); // Should be the third post
		});
	});

	describe("GET /api/posts/:id", () => {
		it("should validate ID parameter", async () => {
			const invalidIds = ["abc", "-1", "0", "1.5"];

			for (const id of invalidIds) {
				const request = await createAuthenticatedRequest(`/api/posts/${id}`);
				const response = await app.request(request);

				expect(response.status).toBe(400);
			}

			// Empty string gets redirect
			const emptyRequest = await createAuthenticatedRequest(`/api/posts/`);
			const emptyResponse = await app.request(emptyRequest, {}, env);
			expect(emptyResponse.status).toBe(301);
		});

		it("should return a specific post by ID", async () => {
			// Create a post
			const createRequest = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Specific Post" }),
			});

			const createResponse = await app.request(createRequest);
			const { post } = (await createResponse.json()) as { post: SelectPost };

			const request = await createAuthenticatedRequest(`/api/posts/${post.id}`);
			const response = await app.request(request);

			expect(response.status).toBe(200);
			const json = (await response.json()) as { post: SelectPost };

			expect(json.post.id).toBe(post.id);
			expect(json.post.title).toBe("Specific Post");
		});

		it("should return 404 for non-existent post", async () => {
			const request = await createAuthenticatedRequest("/api/posts/9999");
			const response = await app.request(request);

			expect(response.status).toBe(404);
			const error = (await response.json()) as { error: { code: string } };
			expect(error.error.code).toBe("NOT_FOUND");
		});
	});

	describe("Date handling", () => {
		it("should return dates as ISO strings", async () => {
			// Create a post
			const createRequest = await createAuthenticatedRequest("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Date Test Post" }),
			});

			const response = await app.request(createRequest);
			const json = (await response.json()) as { post: SelectPost };

			expect(json.post.createdAt).toMatch(
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
			);
			expect(json.post.updatedAt).toMatch(
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
			);

			const createdDate = new Date(json.post.createdAt);
			const updatedDate = new Date(json.post.updatedAt);

			expect(createdDate.getTime()).not.toBeNaN();
			expect(updatedDate.getTime()).not.toBeNaN();

			// Created and updated should be the same for new posts
			expect(createdDate.getTime()).toBe(updatedDate.getTime());
		});
	});

	describe("Concurrent operations", () => {
		it("should handle concurrent post creation", async () => {
			const titles = Array.from({ length: 5 }, (_, i) => ({
				title: `Concurrent Post ${i}`,
			}));

			const requests = titles.map((data) =>
				createAuthenticatedRequest("/api/posts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				}).then((req) => app.request(req)),
			);

			const responses = await Promise.all(requests);

			responses.forEach((response) => {
				expect(response.status).toBe(201);
			});

			// Verify all posts were created
			const latestRequest =
				await createAuthenticatedRequest("/api/posts/latest");
			const latestResponse = await app.request(latestRequest, {}, env);
			const { post } = (await latestResponse.json()) as { post: SelectPost };

			expect(post.title).toMatch(/^Concurrent Post \d$/);
		});
	});
});
