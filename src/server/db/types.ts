import { createInsertSchema, createSelectSchema,createUpdateSchema } from "drizzle-zod";
import { quotes } from "./schema";

export const quoteCreateSchema = createInsertSchema(quotes);
export const quoteSelectSchema = createSelectSchema(quotes);
export const quoteUpdateSchema = createUpdateSchema(quotes);

export type QuoteSlect = typeof quotes.$inferSelect;
export type QuoteCreate = typeof quotes.$inferInsert;
export type QuoteUpdate = Partial<typeof quotes.$inferSelect>;

// 用于身份验证的用户类型
export type User = {
  id: number
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}