import type { Context } from "hono";
import { eq, desc, and, like } from "drizzle-orm";
import { books } from "@/server/db/tables";
import type { BaseContext } from "@/server/lib/types";
import {
	NotFoundError,
	ValidationError,
	ConflictError,
} from "@/server/core/error-handler";

/**
 * Get all books
 */
export async function getAllBooks(c: Context<BaseContext>) {
	const db = c.get("db");
	
	// Optional query parameters for filtering and pagination
	const { genre, author, available, limit = "50", offset = "0" } = c.req.query();
	
	// Build conditions
	const conditions = [];
	if (genre) conditions.push(eq(books.genre, genre));
	if (author) conditions.push(like(books.author, `%${author}%`));
	if (available !== undefined) conditions.push(eq(books.isAvailable, available === "true"));
	
	// Build and execute query
	const booksList = await db
		.select()
		.from(books)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.limit(parseInt(limit))
		.offset(parseInt(offset))
		.orderBy(desc(books.updatedAt));
	
	return c.json({ books: booksList });
}

/**
 * Get books by ID
 */
export async function getBooksById(c: Context<BaseContext>) {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	const result = await db
		.select()
		.from(books)
		.where(eq(books.id, id))
		.limit(1);

	if (!result[0]) {
		throw new NotFoundError("Book not found");
	}

	return c.json({ book: result[0] });
}

/**
 * Create a new books
 */
export async function createBooks(c: Context<BaseContext>) {
	const db = c.get("db");
	const data = await c.req.json();

	try {
		// Validate required fields
		if (!data.title || !data.author) {
			throw new ValidationError("Title and author are required");
		}

		const [newBook] = await db
			.insert(books)
			.values({
				...data,
				// Ensure price is stored as integer (cents)
				price: data.price ? Math.round(data.price * 100) : null,
			})
			.returning();

		return c.json({ book: newBook }, 201);
	} catch (error) {
		// Handle unique constraint violations
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new ConflictError("Book with this ISBN already exists");
		}
		throw error;
	}
}

/**
 * Update books by ID
 */
export async function updateBooks(c: Context<BaseContext>) {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	const data = await c.req.json();
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	// Prepare update data
	const updateData: any = { ...data };
	
	// Convert price to cents if provided
	if (data.price !== undefined) {
		updateData.price = Math.round(data.price * 100);
	}

	const [updatedBook] = await db
		.update(books)
		.set(updateData)
		.where(eq(books.id, id))
		.returning();

	if (!updatedBook) {
		throw new NotFoundError("Book not found");
	}

	return c.json({ book: updatedBook });
}

/**
 * Delete books by ID
 */
export async function deleteBooks(c: Context<BaseContext>) {
	const db = c.get("db");
	const id = Number(c.req.param("id"));
	
	if (isNaN(id)) {
		throw new ValidationError("Invalid ID format");
	}

	const [deletedBook] = await db
		.delete(books)
		.where(eq(books.id, id))
		.returning();

	if (!deletedBook) {
		throw new NotFoundError("Book not found");
	}

	return c.json({ message: "Book deleted successfully" });
}