import type { Ingredient, ProcessingTask } from "./routers/kitchen";

// 队列消息类型
interface QueueMessage {
	taskId: string;
	action: "process_ingredient" | "complete_task";
	ingredient: Ingredient;
	userId: string;
	timestamp: string;
	retryCount?: number;
}

// 队列消费者函数
export async function queueConsumer(
	batch: MessageBatch<QueueMessage>,
	env: Env,
	ctx: ExecutionContext,
): Promise<void> {
	console.log("🍳 处理 " + batch.messages.length + " 个队列消息");
	console.log("⏰ 队列处理开始时间:", new Date().toISOString());

	for (const message of batch.messages) {
		try {
			const { taskId, ingredient, userId, retryCount = 0 } = message.body;

			console.log(
				"🥕 开始处理食材: " + ingredient.name + " (任务ID: " + taskId + ")",
				"预计处理时间:",
				ingredient.processingTime + "秒",
			);

			// 模拟加工过程 - 只设置开始和结束时间，不需要实际等待
			await simulateProcessing(taskId, ingredient, env);

			// 确认消息处理成功
			message.ack();

			console.log(
				"✅ 食材 " +
					ingredient.name +
					" 处理任务已启动 (任务ID: " +
					taskId +
					")",
			);
		} catch (error) {
			console.error("❌ 处理队列消息失败:", error);

			// 尝试将任务标记为失败
			try {
				await markTaskAsFailed(message.body.taskId, env);
			} catch (failError) {
				console.error("标记任务失败时出错:", failError);
			}

			message.ack();
		}
	}

	console.log("🏁 队列批处理完成时间:", new Date().toISOString());
}

// 简化的食材加工过程 - 只设置时间，不实际等待
async function simulateProcessing(
	taskId: string,
	ingredient: Ingredient,
	env: Env,
): Promise<void> {
	const kv = env.KV;

	console.log(
		"⏱️  食材 " +
			ingredient.name +
			" 开始加工，处理时间 " +
			ingredient.processingTime +
			" 秒",
	);

	try {
		// 获取当前任务
		const task = (await kv.get(
			"task:" + taskId,
			"json",
		)) as ProcessingTask | null;
		if (!task) {
			console.error("任务 " + taskId + " 不存在");
			return;
		}

		// 设置任务状态和时间
		const now = new Date();
		const endTime = new Date(now.getTime() + ingredient.processingTime * 1000);

		task.status = "processing";
		task.progress = 0;
		task.startTime = now.toISOString();
		task.updatedAt = now.toISOString();
		// 预设结束时间，用于前端计算进度
		task.estimatedEndTime = endTime.toISOString();

		await kv.put("task:" + taskId, JSON.stringify(task), {
			expirationTtl: 24 * 60 * 60, // 24小时
		});

		// 调度任务完成检查（在处理时间后执行）
		await scheduleTaskCompletion(
			taskId,
			ingredient,
			env,
			ingredient.processingTime,
		);

		console.log(
			"📅 食材 " + ingredient.name + " 预计完成时间: " + endTime.toISOString(),
		);
	} catch (error) {
		console.error("处理任务时发生错误:", error);
		await markTaskAsFailed(taskId, env);
	}
}

// 调度任务完成检查
async function scheduleTaskCompletion(
	taskId: string,
	ingredient: Ingredient,
	env: Env,
	delaySeconds: number,
): Promise<void> {
	console.log(
		`⏰ 调度食材 ${ingredient.name} 完成检查，延迟 ${delaySeconds} 秒`,
	);

	// 发送延迟消息到队列进行完成检查
	await env.QUEUES.send(
		{
			taskId: taskId,
			action: "complete_task",
			ingredient: ingredient,
			userId: "",
			timestamp: new Date().toISOString(),
		},
		{
			delaySeconds: Math.ceil(delaySeconds),
		},
	);
}

// 完成任务处理
async function completeTask(
	taskId: string,
	ingredient: Ingredient,
	env: Env,
): Promise<void> {
	const kv = env.KV;

	try {
		const task = (await kv.get(
			"task:" + taskId,
			"json",
		)) as ProcessingTask | null;

		if (!task || task.status !== "processing") {
			console.log("任务 " + taskId + " 已不存在或状态异常，跳过完成处理");
			return;
		}

		// 最终处理结果
		const isSuccess = Math.random() > ingredient.failureRate;

		if (isSuccess) {
			task.status = "completed";
			task.progress = 100;
			task.endTime = new Date().toISOString();
			console.log("🎉 食材 " + ingredient.name + " 加工成功！");
		} else {
			// 失败处理
			if (task.retryCount < task.maxRetries) {
				task.retryCount++;
				task.progress = 0;
				task.status = "processing";

				const now = new Date();
				const newEndTime = new Date(
					now.getTime() + ingredient.processingTime * 1000,
				);

				task.startTime = now.toISOString();
				task.estimatedEndTime = newEndTime.toISOString();

				console.log(
					"🔄 食材 " +
						ingredient.name +
						" 加工失败，第 " +
						task.retryCount +
						" 次重试",
				);

				// 保存更新后的任务状态
				await kv.put("task:" + task.id, JSON.stringify(task), {
					expirationTtl: 24 * 60 * 60,
				});

				// 重新调度完成检查
				await scheduleTaskCompletion(
					task.id,
					ingredient,
					env,
					ingredient.processingTime,
				);
				return;
			} else {
				task.status = "failed";
				task.endTime = new Date().toISOString();
				console.log("💥 食材 " + ingredient.name + " 加工最终失败");
			}
		}

		// 保存最终状态
		await kv.put("task:" + task.id, JSON.stringify(task), {
			expirationTtl: 24 * 60 * 60,
		});
	} catch (error) {
		console.error("完成任务时发生错误:", error);
	}
}

// 标记任务为失败
async function markTaskAsFailed(taskId: string, env: Env): Promise<void> {
	try {
		const kv = env.KV;
		const task = (await kv.get(
			"task:" + taskId,
			"json",
		)) as ProcessingTask | null;

		if (task) {
			task.status = "failed";
			task.endTime = new Date().toISOString();
			await kv.put("task:" + taskId, JSON.stringify(task), {
				expirationTtl: 24 * 60 * 60,
			});
		}
	} catch (error) {
		console.error("标记任务失败时出错:", error);
	}
}

// 导出默认消费者函数供 Cloudflare Workers 使用
export default {
	async queue(
		batch: MessageBatch<QueueMessage>,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		// 根据消息类型处理
		for (const message of batch.messages) {
			if (message.body.action === "complete_task") {
				// 处理任务完成
				await completeTask(message.body.taskId, message.body.ingredient, env);
				message.ack();
			} else {
				// 处理其他消息类型，回退到原有逻辑
				break;
			}
		}

		// 如果不是完成消息，使用原有的批处理逻辑
		if (
			batch.messages.length > 0 &&
			batch.messages[0].body.action !== "complete_task"
		) {
			return queueConsumer(batch, env, ctx);
		}
	},
};
