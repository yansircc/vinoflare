import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").unique(),
  publishedYear: integer("published_year"),
  genre: text("genre"),
  description: text("description"),
  pageCount: integer("page_count"),
  language: text("language").default("English"),
  publisher: text("publisher"),
  coverImageUrl: text("cover_image_url"),
  price: integer("price"), // Store as cents to avoid floating point issues
  stock: integer("stock").default(0),
  isAvailable: integer("is_available", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});