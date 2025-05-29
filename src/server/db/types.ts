import { createInsertSchema, createSelectSchema,createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { quotes } from "./schema";

export const quoteCreateSchema = createInsertSchema(quotes);
export const quoteSelectSchema = createSelectSchema(quotes);
export const quoteUpdateSchema = createUpdateSchema(quotes);

// 导出一个和 id 相关的 schema
export const quoteIdSchema = z.object({
  id: z.string().transform((val) => {
    const num = Number.parseInt(val, 10)
    if (Number.isNaN(num)) {
      throw new Error('无效的 ID')
    }
    return num
  }),
})

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