import {
	authMiddleware,
	loggingMiddleware,
	optionalAuthMiddleware,
} from "@/server/middleware/procedures";
import type { BaseContext } from "@/server/types/context";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { KitchenKVStore, processIngredientsSchema } from "./helper";
import { PREDEFINED_INGREDIENTS } from "./mock-data";
import type { Ingredient, ProcessingStatus, ProcessingTask } from "./types";

const app = new Hono<BaseContext>()
	.basePath("/kitchen")
	// GET /kitchen/ingredients - 获取所有可用食材
	.get(
		"/ingredients",
		optionalAuthMiddleware,
		loggingMiddleware,
		async (c) => {
			try {
				return c.json({
					success: true,
					data: PREDEFINED_INGREDIENTS,
					message: "食材列表获取成功",
				});
			} catch (error) {
				console.error("获取食材列表失败:", error);
				throw new HTTPException(500, {
					message: "获取食材列表失败",
					cause: error,
				});
			}
		},
	)

	// GET /kitchen/randomIngredients - 获取随机食材
	.get(
		"/randomIngredients",
		optionalAuthMiddleware,
		loggingMiddleware,
		async (c) => {
			try {
				const count =
					Number(c.req.query("count")) || Math.floor(Math.random() * 5) + 1;
				const store = new KitchenKVStore(c.env.KV, c.env.QUEUES);
				const randomIngredients = store.getRandomIngredients(count);

				return c.json({
					success: true,
					data: randomIngredients,
					message: `随机获得 ${randomIngredients.length} 种食材`,
				});
			} catch (error) {
				console.error("获取随机食材失败:", error);
				throw new HTTPException(500, {
					message: "获取随机食材失败",
					cause: error,
				});
			}
		},
	)

	// POST /kitchen/process - 处理食材（发送到队列）
	.post(
		"/process",
		authMiddleware,
		zValidator("json", processIngredientsSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");
				const { ingredientIds } = c.req.valid("json");

				if (!user) {
					throw new HTTPException(401, { message: "用户未登录" });
				}

				const store = new KitchenKVStore(c.env.KV, c.env.QUEUES);
				const tasks = await store.createProcessingTasks(user.id, ingredientIds);

				return c.json(
					{
						success: true,
						data: tasks,
						message: `${user.name} 成功提交 ${tasks.length} 个食材加工任务`,
					},
					201,
				);
			} catch (error) {
				console.error("创建加工任务失败:", error);
				throw new HTTPException(500, {
					message: "创建加工任务失败",
					cause: error,
				});
			}
		},
	)

	// GET /kitchen/tasks - 获取用户的所有任务
	.get("/tasks", authMiddleware, loggingMiddleware, async (c) => {
		try {
			const user = c.get("user");

			if (!user) {
				throw new HTTPException(401, { message: "用户未登录" });
			}

			const store = new KitchenKVStore(c.env.KV, c.env.QUEUES);
			const tasks = await store.getUserTasks(user.id);

			return c.json({
				success: true,
				data: tasks,
				meta: {
					totalCount: tasks.length,
					completedCount: tasks.filter((t) => t.status === "completed").length,
					processingCount: tasks.filter((t) => t.status === "processing")
						.length,
					failedCount: tasks.filter((t) => t.status === "failed").length,
					requestedBy: user.name,
				},
			});
		} catch (error) {
			console.error("获取任务列表失败:", error);
			throw new HTTPException(500, {
				message: "获取任务列表失败",
				cause: error,
			});
		}
	})

	// GET /kitchen/tasks/:taskId - 获取特定任务详情
	.get(
		"/tasks/:taskId",
		authMiddleware,
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");
				const taskId = c.req.param("taskId");

				if (!user) {
					throw new HTTPException(401, { message: "用户未登录" });
				}

				if (!taskId) {
					throw new HTTPException(400, {
						message: "无效的任务ID",
					});
				}

				const store = new KitchenKVStore(c.env.KV, c.env.QUEUES);
				const task = await store.getTask(taskId);

				if (!task) {
					throw new HTTPException(404, {
						message: "任务不存在",
					});
				}

				// 验证任务所有权
				if (task.userId !== user.id) {
					throw new HTTPException(403, {
						message: "无权访问此任务",
					});
				}

				return c.json({
					success: true,
					data: task,
				});
			} catch (error) {
				console.error("获取任务详情失败:", error);
				throw new HTTPException(500, {
					message: "获取任务详情失败",
					cause: error,
				});
			}
		},
	)

	// DELETE /kitchen/tasks - 清除用户的所有任务
	.delete("/tasks", authMiddleware, loggingMiddleware, async (c) => {
		try {
			const user = c.get("user");

			if (!user) {
				throw new HTTPException(401, { message: "用户未登录" });
			}

			const store = new KitchenKVStore(c.env.KV, c.env.QUEUES);
			await store.clearUserTasks(user.id);

			return c.json({
				success: true,
				message: `已清除 ${user.name} 的所有任务`,
			});
		} catch (error) {
			console.error("清除任务失败:", error);
			throw new HTTPException(500, {
				message: "清除任务失败",
				cause: error,
			});
		}
	})

	// 强制重置所有处理中的任务状态（调试用）
	.post(
		"/tasks/reset-processing",
		authMiddleware,
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");

				if (!user) {
					throw new HTTPException(401, { message: "用户未登录" });
				}

				const kv = c.env.KV;
				let resetCount = 0;

				// 获取所有任务
				const list = await kv.list({ prefix: "task:" });

				for (const key of list.keys) {
					const task = (await kv.get(
						key.name,
						"json",
					)) as ProcessingTask | null;
					if (task && task.userId === user.id && task.status === "processing") {
						// 将处理中的任务重置为待处理
						task.status = "pending";
						task.progress = 0;
						task.startTime = undefined;
						task.estimatedEndTime = undefined;

						await kv.put(key.name, JSON.stringify(task), {
							expirationTtl: 24 * 60 * 60,
						});

						resetCount++;
					}
				}

				return c.json({
					success: true,
					message: `已重置 ${resetCount} 个处理中的任务`,
					resetCount,
				});
			} catch (error) {
				console.error("重置任务状态失败:", error);
				throw new HTTPException(500, {
					message: "重置任务状态失败",
					cause: error,
				});
			}
		},
	);

export const kitchenRouter = app;
export type KitchenRouterType = typeof app;

export type { Ingredient, ProcessingTask, ProcessingStatus };
