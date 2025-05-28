import { createInsertSchema, createSelectSchema,createUpdateSchema } from "drizzle-zod";
import { quotes } from "./schema";

export const quoteCreateSchema = createInsertSchema(quotes);
export const quoteSelectSchema = createSelectSchema(quotes);
export const quoteUpdateSchema = createUpdateSchema(quotes);

export type QuoteCreateSchema = typeof quoteCreateSchema;
export type QuoteSelectSchema = typeof quoteSelectSchema;
export type QuoteUpdateSchema = typeof quoteUpdateSchema;

export type Quote = typeof quotes.$inferSelect;
export type QuoteCreate = typeof quotes.$inferInsert;
