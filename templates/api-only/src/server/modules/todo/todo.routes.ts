import { StatusCodes } from "http-status-codes";
import { APIBuilder } from "@/server/core/api-builder";
import { database } from "@/server/middleware/database";
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
	todoListResponseSchema,
	todoResponseSchema,
	updateTodoSchema,
} from "./todo.schema";

export const createTodoModule = () => {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get all todo
	builder
		.get("/", getAllTodo)
		.summary("Get all todo")
		.description("Retrieves a list of all todo")
		.tags("Todo")
		.security([{ bearerAuth: [] }])
		.response(StatusCodes.OK, {
			description: "Todo list retrieved successfully",
			schema: todoListResponseSchema,
		});

	// Get todo by ID
	builder
		.get("/:id", getTodoById)
		.summary("Get todo by ID")
		.description("Retrieves a specific todo by its ID")
		.tags("Todo")
		.security([{ bearerAuth: [] }])
		.params({ id: todoIdSchema })
		.response(StatusCodes.OK, {
			description: "Todo retrieved successfully",
			schema: todoResponseSchema,
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "Todo not found",
		});

	// Create new todo
	builder
		.post("/", createTodo)
		.summary("Create new todo")
		.description("Creates a new todo with the provided data")
		.tags("Todo")
		.security([{ bearerAuth: [] }])
		.body(insertTodoSchema)
		.response(StatusCodes.CREATED, {
			description: "Todo created successfully",
			schema: todoResponseSchema,
		})
		.response(StatusCodes.BAD_REQUEST, {
			description: "Invalid request data",
		});

	// Update todo
	builder
		.put("/:id", updateTodo)
		.summary("Update todo")
		.description("Updates an existing todo")
		.tags("Todo")
		.security([{ bearerAuth: [] }])
		.params({ id: todoIdSchema })
		.body(updateTodoSchema)
		.response(StatusCodes.OK, {
			description: "Todo updated successfully",
			schema: todoResponseSchema,
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "Todo not found",
		});

	// Delete todo
	builder
		.delete("/:id", deleteTodo)
		.summary("Delete todo")
		.description("Deletes a todo by ID")
		.tags("Todo")
		.security([{ bearerAuth: [] }])
		.params({ id: todoIdSchema })
		.response(StatusCodes.NO_CONTENT, {
			description: "Todo deleted successfully",
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "Todo not found",
		});

	return builder;
};
