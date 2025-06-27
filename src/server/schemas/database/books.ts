import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { books } from "../../db/tables/books.table";

/**
 * Book field validation schemas
 */
const bookIdSchema = z
	.number()
	.int()
	.positive()
	.meta({ example: 1 })
	.describe("Unique identifier of the book");

const bookTitleSchema = z
	.string()
	.min(1, "Title is required")
	.max(255, "Title must be 255 characters or less")
	.trim()
	.meta({ example: "The Great Gatsby" })
	.describe("Title of the book");

const bookAuthorSchema = z
	.string()
	.min(1, "Author is required")
	.max(255, "Author must be 255 characters or less")
	.trim()
	.meta({ example: "F. Scott Fitzgerald" })
	.describe("Author of the book");

const bookIsbnSchema = z
	.string()
	.regex(/^(?:\d{9}[\dX]|\d{13})$/, "Invalid ISBN format")
	.optional()
	.nullable()
	.meta({ example: "9780743273565" })
	.describe("ISBN-10 or ISBN-13");

const bookPublishedYearSchema = z
	.number()
	.int()
	.min(1000, "Published year must be after 1000")
	.max(new Date().getFullYear() + 1, "Published year cannot be in the future")
	.optional()
	.nullable()
	.meta({ example: 1925 })
	.describe("Year of publication");

const bookGenreSchema = z
	.string()
	.max(100, "Genre must be 100 characters or less")
	.optional()
	.nullable()
	.meta({ example: "Fiction" })
	.describe("Genre of the book");

const bookDescriptionSchema = z
	.string()
	.max(2000, "Description must be 2000 characters or less")
	.optional()
	.nullable()
	.meta({ example: "A classic American novel about the Jazz Age" })
	.describe("Book description or summary");

const bookPageCountSchema = z
	.number()
	.int()
	.positive("Page count must be positive")
	.optional()
	.nullable()
	.meta({ example: 180 })
	.describe("Number of pages");

const bookLanguageSchema = z
	.string()
	.max(50, "Language must be 50 characters or less")
	.optional()
	.nullable()
	.meta({ example: "English" })
	.describe("Language of the book");

const bookPublisherSchema = z
	.string()
	.max(255, "Publisher must be 255 characters or less")
	.optional()
	.nullable()
	.meta({ example: "Scribner" })
	.describe("Publisher name");

const bookCoverImageUrlSchema = z
	.string()
	.url("Invalid URL format")
	.optional()
	.nullable()
	.meta({ example: "https://example.com/cover.jpg" })
	.describe("URL to the book cover image");

const bookPriceSchema = z
	.number()
	.int()
	.min(0, "Price cannot be negative")
	.optional()
	.nullable()
	.meta({ example: 1999 })
	.describe("Price in cents");

const bookPriceInputSchema = z
	.number()
	.min(0, "Price cannot be negative")
	.optional()
	.nullable()
	.meta({ example: 19.99 })
	.describe("Price in dollars");

const bookStockSchema = z
	.number()
	.int()
	.min(0, "Stock cannot be negative")
	.optional()
	.nullable()
	.meta({ example: 50 })
	.describe("Number of books in stock");

const bookIsAvailableSchema = z
	.boolean()
	.optional()
	.nullable()
	.meta({ example: true })
	.describe("Whether the book is available for purchase");

const bookCreatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Creation timestamp");

const bookUpdatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Last update timestamp");

/**
 * Book CRUD schemas
 */
export const selectBooksSchema = createSelectSchema(books, {
	id: bookIdSchema,
	title: bookTitleSchema,
	author: bookAuthorSchema,
	isbn: bookIsbnSchema,
	publishedYear: bookPublishedYearSchema,
	genre: bookGenreSchema,
	description: bookDescriptionSchema,
	pageCount: bookPageCountSchema,
	language: bookLanguageSchema,
	publisher: bookPublisherSchema,
	coverImageUrl: bookCoverImageUrlSchema,
	price: bookPriceSchema, // Note: stored as cents in DB
	stock: bookStockSchema,
	isAvailable: bookIsAvailableSchema,
	createdAt: bookCreatedAtSchema,
	updatedAt: bookUpdatedAtSchema,
});

export const insertBooksSchema = createInsertSchema(books, {
	title: bookTitleSchema,
	author: bookAuthorSchema,
	isbn: bookIsbnSchema,
	publishedYear: bookPublishedYearSchema,
	genre: bookGenreSchema,
	description: bookDescriptionSchema,
	pageCount: bookPageCountSchema,
	language: bookLanguageSchema,
	publisher: bookPublisherSchema,
	coverImageUrl: bookCoverImageUrlSchema,
	price: bookPriceInputSchema, // Will be converted to cents in handler
	stock: bookStockSchema,
	isAvailable: bookIsAvailableSchema,
})
	.required({
		title: true,
		author: true,
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	});

export const updateBooksSchema = insertBooksSchema.partial();

// Export individual field schemas for reuse
export {
	bookIdSchema,
	bookTitleSchema,
	bookAuthorSchema,
	bookIsbnSchema,
	bookPublishedYearSchema,
	bookGenreSchema,
	bookDescriptionSchema,
	bookPageCountSchema,
	bookLanguageSchema,
	bookPublisherSchema,
	bookCoverImageUrlSchema,
	bookPriceSchema,
	bookStockSchema,
	bookIsAvailableSchema,
	bookCreatedAtSchema,
	bookUpdatedAtSchema,
};