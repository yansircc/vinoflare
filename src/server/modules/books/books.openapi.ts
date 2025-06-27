import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";
import { insertBooksSchema, selectBooksSchema } from "@/server/schemas/database";

const booksSchema = z.toJSONSchema(selectBooksSchema);
const insertBooksJSONSchema = z.toJSONSchema(insertBooksSchema);

// Response wrapper schemas
const bookResponseSchema = {
	type: "object",
	properties: {
		book: booksSchema,
	},
	required: ["book"],
};

const booksListResponseSchema = {
	type: "object",
	properties: {
		books: {
			type: "array",
			items: booksSchema,
		},
	},
	required: ["books"],
};

export const getAllBooksOpenAPI = {
	tags: ["Books"],
	summary: "Get all books",
	description: "Retrieves all books from the database with optional filtering",
	request: {
		query: [
			{
				name: "genre",
				description: "Filter by genre",
				required: false,
				schema: { type: "string" },
			},
			{
				name: "author",
				description: "Filter by author (partial match)",
				required: false,
				schema: { type: "string" },
			},
			{
				name: "available",
				description: "Filter by availability",
				required: false,
				schema: { type: "boolean" },
			},
			{
				name: "limit",
				description: "Number of results to return (default 50)",
				required: false,
				schema: { type: "integer", minimum: 1, maximum: 100 },
			},
			{
				name: "offset",
				description: "Number of results to skip (default 0)",
				required: false,
				schema: { type: "integer", minimum: 0 },
			},
		],
	},
	responses: {
		[StatusCodes.OK]: {
			description: "Books list retrieved successfully",
			schema: booksListResponseSchema,
		},
	},
};

export const getBooksByIdOpenAPI = {
	tags: ["Books"],
	summary: "Get book by ID",
	description: "Retrieves a specific book by its ID",
	request: {
		params: [
			{
				name: "id",
				description: "Book ID",
				required: true,
				schema: { type: "integer" },
			},
		],
	},
	responses: {
		[StatusCodes.OK]: {
			description: "Book retrieved successfully",
			schema: bookResponseSchema,
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Invalid ID format",
		},
		[StatusCodes.NOT_FOUND]: {
			description: "Book not found",
		},
	},
};

export const createBooksOpenAPI = {
	tags: ["Books"],
	summary: "Create a new book",
	description: "Creates a new book with the provided data",
	request: {
		body: {
			description: "Book data",
			schema: insertBooksJSONSchema,
		},
	},
	responses: {
		[StatusCodes.CREATED]: {
			description: "Book created successfully",
			schema: bookResponseSchema,
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Validation error",
		},
		[StatusCodes.CONFLICT]: {
			description: "Book with this ISBN already exists",
		},
	},
};

export const updateBooksOpenAPI = {
	tags: ["Books"],
	summary: "Update book",
	description: "Updates an existing book by ID",
	request: {
		params: [
			{
				name: "id",
				description: "Book ID",
				required: true,
				schema: { type: "integer" },
			},
		],
		body: {
			description: "Updated book data",
			schema: insertBooksJSONSchema,
		},
	},
	responses: {
		[StatusCodes.OK]: {
			description: "Book updated successfully",
			schema: bookResponseSchema,
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Validation error",
		},
		[StatusCodes.NOT_FOUND]: {
			description: "Book not found",
		},
	},
};

export const deleteBooksOpenAPI = {
	tags: ["Books"],
	summary: "Delete book",
	description: "Deletes a book by ID",
	request: {
		params: [
			{
				name: "id",
				description: "Book ID",
				required: true,
				schema: { type: "integer" },
			},
		],
	},
	responses: {
		[StatusCodes.OK]: {
			description: "Book deleted successfully",
			schema: {
				type: "object",
				properties: {
					message: {
						type: "string",
						example: "Book deleted successfully",
					},
				},
			},
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Invalid ID format",
		},
		[StatusCodes.NOT_FOUND]: {
			description: "Book not found",
		},
	},
};