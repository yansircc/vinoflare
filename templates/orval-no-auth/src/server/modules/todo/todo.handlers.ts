import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import type { BaseContext } from "@/server/lib/worker-types";
import type { InsertTodo, TodoId } from "./todo.schema";
import { todo } from "./todo.table";

export const getAllTodo = async (c: Context<BaseContext>) => {
	const db = c.get("db");

	// Return all todos without user filtering
	const todoList = await db.query.todo.findMany({
		orderBy: (todo, { desc }) => [desc(todo.id)],
	});

	// Always return 200 with array (empty array if no todos)
	return c.json({ todos: todoList }, StatusCodes.OK);
};

export const getTodoById = async (
	c: Context<BaseContext>,
	input: { params?: { id: TodoId } },
) => {
	const id = input.params?.id;
	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	const db = c.get("db");

	const todoItem = await db.query.todo.findFirst({
		where: (todo, { eq }) => eq(todo.id, id),
	});

	if (!todoItem) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: `Todo with ID ${id} not found`,
		});
	}

	return c.json({ todo: todoItem }, StatusCodes.OK);
};

export const createTodo = async (
	c: Context<BaseContext>,
	input: { body?: InsertTodo },
) => {
	const db = c.get("db");
	const todoData = input.body;

	if (!todoData) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	// Create todo without user assignment
	const createdTodos = await db
		.insert(todo)
		.values({
			...todoData,
			// Remove userId assignment
		})
		.returning();

	if (!createdTodos[0]) {
		throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
			message: "Failed to create todo",
		});
	}

	return c.json({ todo: createdTodos[0] }, StatusCodes.CREATED);
};

export const updateTodo = async (
	c: Context<BaseContext>,
	input: { params?: { id: TodoId }; body?: Partial<InsertTodo> },
) => {
	const id = input.params?.id;
	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	const db = c.get("db");
	const updateData = input.body;

	if (!updateData) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	// Update todo without ownership check
	const updatedTodos = await db
		.update(todo)
		.set(updateData)
		.where(eq(todo.id, id))
		.returning();

	if (!updatedTodos[0]) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: `Todo with ID ${id} not found`,
		});
	}

	return c.json({ todo: updatedTodos[0] }, StatusCodes.OK);
};

export const deleteTodo = async (
	c: Context<BaseContext>,
	input: { params?: { id: TodoId } },
) => {
	const id = input.params?.id;
	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	const db = c.get("db");

	// Delete todo without ownership check
	const deletedTodos = await db.delete(todo).where(eq(todo.id, id)).returning();

	if (!deletedTodos[0]) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: `Todo with ID ${id} not found`,
		});
	}

	return c.json({ message: "Todo deleted successfully" }, StatusCodes.OK);
};
