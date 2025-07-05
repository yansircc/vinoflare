import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { todo } from "./todo.table";

// ID validation for params
export const todoIdSchema = z.coerce
	.number()
	.int()
	.positive()
	.meta({ example: 1 })
	.describe("Todo ID");

export const todoTitleSchema = z
	.string()
	.min(1)
	.max(255)
	.meta({ example: "Buy groceries" })
	.describe("Todo title");

export const todoCompletedSchema = z
	.boolean()
	.meta({ example: false })
	.describe("Todo completion status");

// Database schemas
export const selectTodoSchema = createSelectSchema(todo, {
	id: todoIdSchema,
	title: todoTitleSchema,
	completed: todoCompletedSchema,
	createdAt: z.iso.datetime({ offset: true }),
	updatedAt: z.iso.datetime({ offset: true }),
});
export const insertTodoSchema = createInsertSchema(todo).omit({
	id: true,
	userId: true, // userId is set automatically from authenticated user
	createdAt: true,
	updatedAt: true,
});

export const updateTodoSchema = insertTodoSchema.partial();

export type SelectTodo = z.infer<typeof selectTodoSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type TodoId = z.infer<typeof todoIdSchema>;

// Response schemas for API endpoints
export const todoResponseSchema = z.object({
	todo: selectTodoSchema,
});

export const todoListResponseSchema = z.object({
	todos: z.array(selectTodoSchema),
});
