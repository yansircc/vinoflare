import { zValidator } from "@hono/zod-validator";
import { asc, count, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createDb, schema, types } from "../db";
import {
	authMiddleware,
	loggingMiddleware,
	optionalAuthMiddleware,
} from "../middleware/procedures";
import type { BaseContext } from "../types/context";

// 按照 Hono RPC 模式创建留言路由器
const app = new Hono<BaseContext>()
	.get(
		"/quotes",
		optionalAuthMiddleware,
		zValidator("query", types.querySchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const { page, limit, sort, search } = c.req.valid("query");
				const offset = (page - 1) * limit;

				// 构建查询条件
				const query = db.select().from(schema.quotes);

				// 搜索功能（如果提供搜索词）
				if (search) {
					// 注意：这里需要根据你的数据库支持调整搜索逻辑
					// SQLite 可能需要使用 LIKE 操作符
				}

				// 获取总数
				const [{ totalCount }] = await db
					.select({ totalCount: count() })
					.from(schema.quotes);

				// 获取留言列表
				const quotes = await db
					.select()
					.from(schema.quotes)
					.orderBy(
						sort === "newest"
							? desc(schema.quotes.createdAt)
							: asc(schema.quotes.createdAt),
					)
					.limit(limit)
					.offset(offset);

				const totalPages = Math.ceil(totalCount / limit);

				return c.json({
					success: true,
					data: quotes,
					pagination: {
						page,
						limit,
						totalCount,
						totalPages,
						hasNext: page < totalPages,
						hasPrev: page > 1,
					},
					meta: {
						sort,
						search,
						requestedBy: c.get("user")?.name || "anonymous",
					},
				});
			} catch (error) {
				console.error("获取留言列表失败:", error);
				throw new HTTPException(500, {
					message: "获取留言列表失败",
					cause: error,
				});
			}
		},
	)

	// GET /quotes/:id - 获取单条留言
	.get(
		"/quotes/:id",
		optionalAuthMiddleware,
		zValidator("param", types.quoteIdSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const { id } = c.req.valid("param");

				const [quote] = await db
					.select()
					.from(schema.quotes)
					.where(eq(schema.quotes.id, id))
					.limit(1);

				if (!quote) {
					throw new HTTPException(404, {
						message: "留言不存在",
					});
				}

				return c.json({
					success: true,
					data: quote,
				});
			} catch (error) {
				console.error("获取留言失败:", error);
				throw new HTTPException(500, {
					message: "获取留言失败",
					cause: error,
				});
			}
		},
	)

	// POST /quotes - 创建新留言（需要认证）
	.post(
		"/quotes",
		authMiddleware,
		zValidator("json", types.quoteCreateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const user = c.get("user");
				const validatedInput = c.req.valid("json");

				// 简单的防重复机制：检查近期是否有相同邮箱的留言
				const recentQuotes = await db
					.select()
					.from(schema.quotes)
					.where(eq(schema.quotes.email, validatedInput.email))
					.limit(1);

				// 可以添加时间间隔检查，防止垃圾留言

				const [newQuote] = await db
					.insert(schema.quotes)
					.values({
						name: validatedInput.name,
						email: validatedInput.email,
						message: validatedInput.message,
					})
					.returning();

				return c.json(
					{
						success: true,
						data: newQuote,
						message: `留言由 ${user?.name} 成功创建`,
					},
					201,
				);
			} catch (error) {
				console.error("创建留言失败:", error);
				throw new HTTPException(500, {
					message: "创建留言失败",
					cause: error,
				});
			}
		},
	)

	// PUT /quotes/:id - 更新留言（需要认证）
	.put(
		"/quotes/:id",
		authMiddleware,
		zValidator("param", types.quoteIdSchema),
		zValidator("json", types.quoteUpdateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const user = c.get("user");
				const { id } = c.req.valid("param");
				const updateData = c.req.valid("json");

				// 检查留言是否存在
				const [existingQuote] = await db
					.select()
					.from(schema.quotes)
					.where(eq(schema.quotes.id, id))
					.limit(1);

				if (!existingQuote) {
					throw new HTTPException(404, {
						message: "留言不存在",
					});
				}

				// 过滤掉未定义的值
				const filteredUpdateData = Object.fromEntries(
					Object.entries(updateData).filter(
						([_, value]) => value !== undefined,
					),
				);

				if (Object.keys(filteredUpdateData).length === 0) {
					return c.json(
						{
							success: false,
							error: "没有需要更新的字段",
						},
						400,
					);
				}

				const [updatedQuote] = await db
					.update(schema.quotes)
					.set(filteredUpdateData)
					.where(eq(schema.quotes.id, id))
					.returning();

				return c.json({
					success: true,
					data: updatedQuote,
					message: `留言由 ${user?.name} 成功更新`,
				});
			} catch (error) {
				console.error("更新留言失败:", error);
				throw new HTTPException(500, {
					message: "更新留言失败",
					cause: error,
				});
			}
		},
	)

	// DELETE /quotes/:id - 删除留言（需要认证）
	.delete(
		"/quotes/:id",
		authMiddleware,
		zValidator("param", types.quoteIdSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const user = c.get("user");
				const { id } = c.req.valid("param");

				// 检查留言是否存在
				const [existingQuote] = await db
					.select()
					.from(schema.quotes)
					.where(eq(schema.quotes.id, id))
					.limit(1);

				if (!existingQuote) {
					throw new HTTPException(404, {
						message: "留言不存在",
					});
				}

				await db.delete(schema.quotes).where(eq(schema.quotes.id, id));

				return c.json({
					success: true,
					message: `留言《${existingQuote.message.slice(0, 20)}...》由 ${user?.name} 成功删除`,
					deletedId: id,
				});
			} catch (error) {
				console.error("删除留言失败:", error);
				throw new HTTPException(500, {
					message: "删除留言失败",
					cause: error,
				});
			}
		},
	)

	// GET /quotes/stats - 获取留言统计
	.get(
		"/quotes/stats",
		optionalAuthMiddleware,
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);

				// 获取总数
				const [{ totalCount }] = await db
					.select({ totalCount: count() })
					.from(schema.quotes);

				// 获取最近的留言用于统计
				const allQuotes = await db.select().from(schema.quotes);

				const now = new Date();
				const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

				const stats = {
					total: totalCount,
					lastDay: allQuotes.filter((q) => {
						return q.createdAt && new Date(q.createdAt) > oneDayAgo;
					}).length,
					lastWeek: allQuotes.filter((q) => {
						return q.createdAt && new Date(q.createdAt) > oneWeekAgo;
					}).length,
					uniqueEmails: new Set(allQuotes.map((q) => q.email)).size,
					averageMessageLength:
						allQuotes.length > 0
							? Math.round(
									allQuotes.reduce((sum, q) => sum + q.message.length, 0) /
										allQuotes.length,
								)
							: 0,
				};

				return c.json({
					success: true,
					data: stats,
					generatedAt: now.toISOString(),
					requestedBy: c.get("user")?.name || "anonymous",
				});
			} catch (error) {
				console.error("获取留言统计失败:", error);
				throw new HTTPException(500, {
					message: "获取留言统计失败",
					cause: error,
				});
			}
		},
	);

export const quotesRouter = app;
export type QuotesRouterType = typeof app;
