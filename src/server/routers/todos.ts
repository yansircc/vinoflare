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

// 按照 Hono RPC 模式创建待办事项路由器
const app = new Hono<BaseContext>()
	.basePath("/todos")
	.get(
		"/",
		optionalAuthMiddleware,
		zValidator("query", types.querySchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const { page, limit, sort, search } = c.req.valid("query");
				const offset = (page - 1) * limit;

				// 构建查询条件
				const query = db.select().from(schema.todos);

				// 搜索功能（如果提供搜索词）
				if (search) {
					// 注意：这里需要根据你的数据库支持调整搜索逻辑
					// SQLite 可能需要使用 LIKE 操作符
				}

				// 获取总数
				const [{ totalCount }] = await db
					.select({ totalCount: count() })
					.from(schema.todos);

				// 获取待办事项列表
				const todos = await db
					.select()
					.from(schema.todos)
					.orderBy(
						sort === "newest"
							? desc(schema.todos.createdAt)
							: asc(schema.todos.createdAt),
					)
					.limit(limit)
					.offset(offset);

				const totalPages = Math.ceil(totalCount / limit);

				return c.json({
					success: true,
					data: todos,
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
				console.error("获取待办事项列表失败:", error);
				throw new HTTPException(500, {
					message: "获取待办事项列表失败",
					cause: error,
				});
			}
		},
	)

	// GET /todos/:id - 获取单条待办事项
	.get(
		"/:id",
		optionalAuthMiddleware,
		zValidator("param", types.todoIdSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const { id } = c.req.valid("param");

				const [todo] = await db
					.select()
					.from(schema.todos)
					.where(eq(schema.todos.id, id))
					.limit(1);

				if (!todo) {
					throw new HTTPException(404, {
						message: "待办事项不存在",
					});
				}

				return c.json({
					success: true,
					data: todo,
				});
			} catch (error) {
				console.error("获取待办事项失败:", error);
				throw new HTTPException(500, {
					message: "获取待办事项失败",
					cause: error,
				});
			}
		},
	)

	// POST /todos - 创建新待办事项（需要认证）
	.post(
		"/",
		authMiddleware,
		zValidator("json", types.todoCreateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const user = c.get("user");
				const validatedInput = c.req.valid("json");

				const [newTodo] = await db
					.insert(schema.todos)
					.values({
						title: validatedInput.title,
						description: validatedInput.description,
						completed: validatedInput.completed || false,
						priority: validatedInput.priority || "medium",
					})
					.returning();

				return c.json(
					{
						success: true,
						data: newTodo,
						message: `待办事项由 ${user?.name} 成功创建`,
					},
					201,
				);
			} catch (error) {
				console.error("创建待办事项失败:", error);
				throw new HTTPException(500, {
					message: "创建待办事项失败",
					cause: error,
				});
			}
		},
	)

	// PUT /todos/:id - 更新待办事项（需要认证）
	.put(
		"/:id",
		authMiddleware,
		zValidator("param", types.todoIdSchema),
		zValidator("json", types.todoUpdateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const user = c.get("user");
				const { id } = c.req.valid("param");
				const updateData = c.req.valid("json");

				// 检查待办事项是否存在
				const [existingTodo] = await db
					.select()
					.from(schema.todos)
					.where(eq(schema.todos.id, id))
					.limit(1);

				if (!existingTodo) {
					throw new HTTPException(404, {
						message: "待办事项不存在",
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

				// 添加更新时间
				filteredUpdateData.updatedAt = new Date().toISOString();

				const [updatedTodo] = await db
					.update(schema.todos)
					.set(filteredUpdateData)
					.where(eq(schema.todos.id, id))
					.returning();

				return c.json({
					success: true,
					data: updatedTodo,
					message: `待办事项由 ${user?.name} 成功更新`,
				});
			} catch (error) {
				console.error("更新待办事项失败:", error);
				throw new HTTPException(500, {
					message: "更新待办事项失败",
					cause: error,
				});
			}
		},
	)

	// DELETE /todos/:id - 删除待办事项（需要认证）
	.delete(
		"/:id",
		authMiddleware,
		zValidator("param", types.todoIdSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const db = createDb(c.env.DB);
				const user = c.get("user");
				const { id } = c.req.valid("param");

				// 检查待办事项是否存在
				const [existingTodo] = await db
					.select()
					.from(schema.todos)
					.where(eq(schema.todos.id, id))
					.limit(1);

				if (!existingTodo) {
					throw new HTTPException(404, {
						message: "待办事项不存在",
					});
				}

				await db.delete(schema.todos).where(eq(schema.todos.id, id));

				return c.json({
					success: true,
					message: `待办事项《${existingTodo.title}》由 ${user?.name} 成功删除`,
					deletedId: id,
				});
			} catch (error) {
				console.error("删除待办事项失败:", error);
				throw new HTTPException(500, {
					message: "删除待办事项失败",
					cause: error,
				});
			}
		},
	)

	// GET /todos/stats - 获取待办事项统计
	.get("/stats", optionalAuthMiddleware, loggingMiddleware, async (c) => {
		try {
			const db = createDb(c.env.DB);

			// 获取总数
			const [{ totalCount }] = await db
				.select({ totalCount: count() })
				.from(schema.todos);

			// 获取最近的待办事项用于统计
			const allTodos = await db.select().from(schema.todos);

			const now = new Date();
			const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

			const stats = {
				total: totalCount,
				completed: allTodos.filter((t) => t.completed).length,
				pending: allTodos.filter((t) => !t.completed).length,
				lastDay: allTodos.filter((t) => {
					return t.createdAt && new Date(t.createdAt) > oneDayAgo;
				}).length,
				lastWeek: allTodos.filter((t) => {
					return t.createdAt && new Date(t.createdAt) > oneWeekAgo;
				}).length,
				byPriority: {
					high: allTodos.filter((t) => t.priority === "high").length,
					medium: allTodos.filter((t) => t.priority === "medium").length,
					low: allTodos.filter((t) => t.priority === "low").length,
				},
			};

			return c.json({
				success: true,
				data: stats,
				generatedAt: now.toISOString(),
				requestedBy: c.get("user")?.name || "anonymous",
			});
		} catch (error) {
			console.error("获取待办事项统计失败:", error);
			throw new HTTPException(500, {
				message: "获取待办事项统计失败",
				cause: error,
			});
		}
	});

export const todosRouter = app;
export type TodosRouterType = typeof app;
