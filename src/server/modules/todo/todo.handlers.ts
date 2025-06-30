import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import type { BaseContext } from "@/server/lib/worker-types";
import type { InsertTodo, TodoId } from "./todo.schema";
import { todo } from "./todo.table";

export const getAllTodo = async (c: Context<BaseContext>) => {
	const db = c.get("db");
	const todoList = await db.query.todo.findMany({
		orderBy: (todo, { desc }) => [desc(todo.id)],
	});

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
	const todo = await db.query.todo.findFirst({
		where: (todo, { eq }) => eq(todo.id, id),
	});

	if (!todo) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "Todo not found",
		});
	}

	return c.json({ todo }, StatusCodes.OK);
};

export const createTodo = async (
	c: Context<BaseContext>,
	input: { body?: InsertTodo },
) => {
	if (!input.body) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	const db = c.get("db");

	// Create the todo
	const [newTodo] = await db.insert(todo).values(input.body).returning();

	return c.json({ todo: newTodo }, StatusCodes.CREATED);
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

	if (!input.body) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	const db = c.get("db");

	// Check if exists
	const existing = await db.query.todo.findFirst({
		where: (todo, { eq }) => eq(todo.id, id),
	});

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "Todo not found",
		});
	}

	// Update the todo
	const [updatedTodo] = await db
		.update(todo)
		.set(input.body)
		.where(eq(todo.id, id))
		.returning();

	return c.json({ todo: updatedTodo }, StatusCodes.OK);
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

	// Check if exists
	const existing = await db.query.todo.findFirst({
		where: (todo, { eq }) => eq(todo.id, id),
	});

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "Todo not found",
		});
	}

	// Delete the todo
	await db.delete(todo).where(eq(todo.id, id));

	return c.json({ message: "Todo deleted successfully" }, StatusCodes.OK);
};
