/**
 * RPC-compatible routes for Todo module
 * This file exports Hono routes that can be used with hono/client
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { BaseContext } from "@/server/lib/worker-types";
import {
	createTodo,
	deleteTodo,
	getAllTodo,
	getTodoById,
	updateTodo,
} from "./todo.handlers";
import {
	insertTodoSchema,
	todoIdSchema,
	updateTodoSchema,
} from "./todo.schema";

// Create RPC-compatible routes using handlers directly
export const todoRpcRoutes = new Hono<BaseContext>()
	// Get all todos
	.get("/", async (c) => {
		const result = await getAllTodo(c);
		return c.json(result.data);
	})
	// Get todo by ID
	.get("/:id", zValidator("param", todoIdSchema), async (c) => {
		const result = await getTodoById(c, {
			params: { id: Number(c.req.param("id")) },
		});
		return c.json(result.data);
	})
	// Create todo
	.post("/", zValidator("json", insertTodoSchema), async (c) => {
		const result = await createTodo(c, {
			body: c.req.valid("json"),
		});
		return c.json(result.data);
	})
	// Update todo
	.put(
		"/:id",
		zValidator("param", todoIdSchema),
		zValidator("json", updateTodoSchema),
		async (c) => {
			const result = await updateTodo(c, {
				params: { id: Number(c.req.param("id")) },
				body: c.req.valid("json"),
			});
			return c.json(result.data);
		},
	)
	// Delete todo
	.delete("/:id", zValidator("param", todoIdSchema), async (c) => {
		const result = await deleteTodo(c, {
			params: { id: Number(c.req.param("id")) },
		});
		// For RPC, return the deleted todo data instead of 204
		return c.json(result.data);
	});

// Export the type
export type TodoRpcType = typeof todoRpcRoutes;
