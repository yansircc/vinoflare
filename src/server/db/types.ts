import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { quotes, type session, type user } from "./schema";

// quote
export const quoteCreateSchema = createInsertSchema(quotes);
export const quoteSelectSchema = createSelectSchema(quotes);
export const quoteUpdateSchema = createUpdateSchema(quotes);

// 导出一个和 id 相关的 schema
export const quoteIdSchema = z.object({
	id: z.string().transform((val) => {
		const num = Number.parseInt(val, 10);
		if (Number.isNaN(num)) {
			throw new Error("无效的 ID");
		}
		return num;
	}),
});

export type QuoteSlect = typeof quotes.$inferSelect;
export type QuoteCreate = typeof quotes.$inferInsert;
export type QuoteUpdate = Partial<typeof quotes.$inferSelect>;

// Better Auth 用户类型
export type AuthUser = typeof user.$inferSelect;
export type AuthUserCreate = typeof user.$inferInsert;

// Better Auth Session
export type AuthSession = typeof session.$inferSelect;

// querySchema
export const querySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => Number.parseInt(val || "1") || 1)
		.pipe(z.number().min(1).max(100)),
	limit: z
		.string()
		.optional()
		.transform((val) => Number.parseInt(val || "10") || 10)
		.pipe(z.number().min(1).max(50)),
	sort: z.enum(["newest", "oldest"]).default("newest"),
	search: z.string().optional(),
});
