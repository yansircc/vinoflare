import { APIBuilder } from "@/server/lib/api-builder";
import { database } from "@/server/middleware/database";
import { insertBooksSchema, updateBooksSchema } from "@/server/schemas/database";
import {
	getAllBooks,
	getBooksById,
	createBooks,
	updateBooks,
	deleteBooks,
} from "./books.handlers";
import {
	getAllBooksOpenAPI,
	getBooksByIdOpenAPI,
	createBooksOpenAPI,
	updateBooksOpenAPI,
	deleteBooksOpenAPI,
} from "./books.openapi";

export function createBooksModule() {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get all books
	builder.addRoute({
		method: "get",
		path: "/",
		handler: getAllBooks,
		openapi: getAllBooksOpenAPI,
	});

	// Get books by ID
	builder.addRoute({
		method: "get",
		path: "/:id",
		handler: getBooksById,
		openapi: getBooksByIdOpenAPI,
	});

	// Create new books
	builder.addRoute({
		method: "post",
		path: "/",
		validation: {
			body: insertBooksSchema,
		},
		handler: createBooks,
		openapi: createBooksOpenAPI,
	});

	// Update books
	builder.addRoute({
		method: "put",
		path: "/:id",
		validation: {
			body: updateBooksSchema,
		},
		handler: updateBooks,
		openapi: updateBooksOpenAPI,
	});

	// Delete books
	builder.addRoute({
		method: "delete",
		path: "/:id",
		handler: deleteBooks,
		openapi: deleteBooksOpenAPI,
	});

	return builder;
}