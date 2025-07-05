import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ModuleRegistry } from "@/server/db/modular";
import { createTestApp } from "@/server/tests/test-helpers";
import todoModule from "../index";
import type { SelectTodo } from "../todo.schema";
import { createTestTodo, resetTodoTestData } from "./todo.test-utils";

describe("Todo Module", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeAll(async () => {
		// Register module for database middleware
		ModuleRegistry.register([todoModule]);

		// Create test app
		app = createTestApp([todoModule], env);

		// Fix the test database by dropping and recreating the todo table
		// This is needed because the test DB has an old schema with user_id
		await env.DB.prepare("DROP TABLE IF EXISTS todo").run();
		await env.DB.prepare(`
			CREATE TABLE todo (
				id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
				title TEXT NOT NULL,
				completed INTEGER DEFAULT false NOT NULL,
				created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
				updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
			)
		`).run();
	});

	beforeEach(async () => {
		// Clean up test data
		await env.DB.prepare("DELETE FROM todo").run();
		resetTodoTestData();
	});

	it("should create a todo", async () => {
		const todoData = createTestTodo({
			/* your fields here */
		});
		const request = new Request("http://localhost/api/todo", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(todoData),
		});

		const response = await app.request(request);
		expect(response.status).toBe(201);
		const json = (await response.json()) as { todo: SelectTodo };
		// Add your assertions here
		expect(json.todo).toBeDefined();
		expect(json.todo.title).toBe(todoData.title);
	});

	it("should get a todo by ID", async () => {
		// Create a todo first
		const createReq = new Request("http://localhost/api/todo", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(createTestTodo()),
		});
		const createResponse = await app.request(createReq);
		const { todo } = (await createResponse.json()) as { todo: SelectTodo };

		// Get the todo
		const getReq = new Request(`http://localhost/api/todo/${todo.id}`);
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should get all todo", async () => {
		// Create a todo first
		const createReq = new Request("http://localhost/api/todo", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(createTestTodo()),
		});
		await app.request(createReq);

		const getReq = new Request("http://localhost/api/todo");
		const response = await app.request(getReq);
		expect(response.status).toBe(200);
	});

	it("should validate required fields", async () => {
		const request = new Request("http://localhost/api/todo", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}), // Empty body
		});

		const response = await app.request(request);
		expect(response.status).toBe(400);
	});
});
