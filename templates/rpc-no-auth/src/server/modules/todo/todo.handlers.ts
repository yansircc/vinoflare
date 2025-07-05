import { eq, type InferSelectModel } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import type { HandlerResult } from "@/server/core/api-builder";
import type { BaseContext } from "@/server/lib/worker-types";
import type { InsertTodo, SelectTodo, TodoId } from "./todo.schema";
import { todo } from "./todo.table";

// Use Drizzle's inferred type directly
type TodoRecord = InferSelectModel<typeof todo>;

// Helper to convert Date to ISO string for API responses
function serializeTodo(todo: TodoRecord): SelectTodo {
	return {
		...todo,
		createdAt: todo.createdAt.toISOString(),
		updatedAt: todo.updatedAt.toISOString(),
	};
}

// Simple context type that matches both Hono Context and our needs
type SimpleContext = {
	get(key: "db"): BaseContext["Variables"]["db"];
};

export const getAllTodo = async (
	c: SimpleContext,
): Promise<HandlerResult<{ todos: SelectTodo[] }>> => {
	const db = c.get("db");

	const todos = await db
		.select()
		.from(todo)
		.orderBy(() => todo.id);

	return {
		data: { todos: todos.map(serializeTodo) },
		status: StatusCodes.OK,
	};
};

export const getTodoById = async (
	c: SimpleContext,
	input: { params?: { id: TodoId } },
): Promise<HandlerResult<{ todo: SelectTodo }>> => {
	const db = c.get("db");
	const id = input.params?.id;

	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	const [todoItem] = await db
		.select()
		.from(todo)
		.where(eq(todo.id, id))
		.limit(1);

	if (!todoItem) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: `Todo with id ${id} not found`,
		});
	}

	return {
		data: { todo: serializeTodo(todoItem) },
		status: StatusCodes.OK,
	};
};

export const createTodo = async (
	c: SimpleContext,
	input: { body?: InsertTodo },
): Promise<HandlerResult<{ todo: SelectTodo }>> => {
	const db = c.get("db");
	const data = input.body;

	if (!data) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	const [newTodo] = await db.insert(todo).values(data).returning();

	return {
		data: { todo: serializeTodo(newTodo) },
		status: StatusCodes.CREATED,
	};
};

export const updateTodo = async (
	c: SimpleContext,
	input: { params?: { id: TodoId }; body?: Partial<InsertTodo> },
): Promise<HandlerResult<{ todo: SelectTodo }>> => {
	const db = c.get("db");
	const id = input.params?.id;
	const data = input.body;

	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	if (!data) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	// Check if exists
	const [existing] = await db
		.select()
		.from(todo)
		.where(eq(todo.id, id))
		.limit(1);

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: `Todo with id ${id} not found`,
		});
	}

	const [updatedTodo] = await db
		.update(todo)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(todo.id, id))
		.returning();

	return {
		data: { todo: serializeTodo(updatedTodo) },
		status: StatusCodes.OK,
	};
};

export const deleteTodo = async (
	c: SimpleContext,
	input: { params?: { id: TodoId } },
): Promise<HandlerResult<{ todo: SelectTodo } | null>> => {
	const db = c.get("db");
	const id = input.params?.id;

	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	// Check if exists
	const [existing] = await db
		.select()
		.from(todo)
		.where(eq(todo.id, id))
		.limit(1);

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: `Todo with id ${id} not found`,
		});
	}

	const [deletedTodo] = await db
		.delete(todo)
		.where(eq(todo.id, id))
		.returning();

	return {
		data: { todo: serializeTodo(deletedTodo) },
		status: StatusCodes.NO_CONTENT,
	};
};
