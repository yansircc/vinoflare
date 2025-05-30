import { z } from "zod";
import { PREDEFINED_INGREDIENTS } from "./mock-data";
import type { Ingredient, ProcessingTask } from "./types";

// 验证器
export const processIngredientsSchema = z.object({
	ingredientIds: z
		.array(z.string())
		.min(1, "至少选择一种食材")
		.max(10, "最多选择10种食材"),
});

// KV 存储的辅助函数
export class KitchenKVStore {
	constructor(
		private kv: KVNamespace,
		private queue: Queue,
	) {}

	// 生成任务 ID
	private generateTaskId(): string {
		return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	// 获取用户的所有任务
	async getUserTasks(userId: string): Promise<ProcessingTask[]> {
		const taskIds =
			((await this.kv.get(`user:${userId}:tasks`, "json")) as string[]) || [];
		const tasks: ProcessingTask[] = [];

		for (const taskId of taskIds) {
			const task = await this.getTask(taskId);
			if (task) tasks.push(task);
		}

		return tasks.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	}

	// 保存用户任务 ID 列表
	async saveUserTaskIds(userId: string, taskIds: string[]): Promise<void> {
		await this.kv.put(`user:${userId}:tasks`, JSON.stringify(taskIds), {
			expirationTtl: 24 * 60 * 60, // 24小时
		});
	}

	// 获取单个任务
	async getTask(taskId: string): Promise<ProcessingTask | null> {
		const task = (await this.kv.get(
			`task:${taskId}`,
			"json",
		)) as ProcessingTask | null;
		return task;
	}

	// 保存任务
	async saveTask(task: ProcessingTask): Promise<void> {
		await this.kv.put(`task:${task.id}`, JSON.stringify(task), {
			expirationTtl: 24 * 60 * 60, // 24小时
		});
	}

	// 创建加工任务并发送到队列
	async createProcessingTasks(
		userId: string,
		ingredientIds: string[],
	): Promise<ProcessingTask[]> {
		const tasks: ProcessingTask[] = [];
		const now = new Date().toISOString();

		// 获取用户现有任务 ID
		const existingTaskIds =
			((await this.kv.get(`user:${userId}:tasks`, "json")) as string[]) || [];

		for (const ingredientId of ingredientIds) {
			const ingredient = PREDEFINED_INGREDIENTS.find(
				(ing) => ing.id === ingredientId,
			);
			if (!ingredient) continue;

			const taskId = this.generateTaskId();
			const task: ProcessingTask = {
				id: taskId,
				userId,
				ingredient,
				status: "pending",
				progress: 0,
				retryCount: 0,
				maxRetries: 3,
				createdAt: now,
				updatedAt: now,
			};

			// 保存任务
			await this.saveTask(task);
			tasks.push(task);

			// 发送到队列 - 移除 action 字段，匹配新的消息格式
			await this.queue.send({
				taskId,
				ingredient,
				userId,
				timestamp: now,
			});

			// 添加到用户任务列表
			existingTaskIds.push(taskId);
		}

		// 保存更新后的任务 ID 列表
		await this.saveUserTaskIds(userId, existingTaskIds);

		return tasks;
	}

	// 清除用户的所有任务
	async clearUserTasks(userId: string): Promise<void> {
		const taskIds =
			((await this.kv.get(`user:${userId}:tasks`, "json")) as string[]) || [];

		// 删除所有任务数据
		for (const taskId of taskIds) {
			await this.kv.delete(`task:${taskId}`);
		}

		// 清空用户任务列表
		await this.kv.delete(`user:${userId}:tasks`);
	}

	// 获取随机食材
	getRandomIngredients(
		count: number = Math.floor(Math.random() * 5) + 1,
	): Ingredient[] {
		const shuffled = [...PREDEFINED_INGREDIENTS].sort(
			() => 0.5 - Math.random(),
		);
		return shuffled.slice(0, Math.min(count, PREDEFINED_INGREDIENTS.length));
	}
}
