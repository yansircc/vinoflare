import type { Ingredient, ProcessingTask } from "./routers/kitchen";

// 队列消息类型
interface QueueMessage {
	taskId: string;
	action: "process_ingredient";
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

			// 启动后台处理，使用 ctx.waitUntil 确保处理完成
			const processingPromise = simulateProcessing(
				taskId,
				ingredient,
				env,
				ctx,
			);
			ctx.waitUntil(processingPromise);

			// 立即确认消息，避免队列超时
			message.ack();

			console.log(
				"✅ 食材 " + ingredient.name + " 已开始处理 (任务ID: " + taskId + ")",
			);
		} catch (error) {
			console.error("❌ 处理队列消息失败:", error);
			message.ack(); // 确认消息以避免重复处理
		}
	}

	console.log("🏁 队列批处理完成时间:", new Date().toISOString());
}

// 模拟食材加工过程
async function simulateProcessing(
	taskId: string,
	ingredient: Ingredient,
	env: Env,
	ctx: ExecutionContext,
): Promise<void> {
	const kv = env.KV;
	const processingTime = ingredient.processingTime * 1000; // 转换为毫秒
	const updateInterval = Math.max(500, processingTime / 20); // 每5%更新一次，最少500ms

	console.log(
		"⏱️  食材 " +
			ingredient.name +
			" 需要处理 " +
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

		// 确保任务状态为 processing
		task.status = "processing";
		task.startTime = new Date().toISOString();
		await kv.put("task:" + taskId, JSON.stringify(task), {
			expirationTtl: 24 * 60 * 60, // 24小时
		});

		// 模拟渐进式进度更新
		for (let progress = 0; progress <= 100; progress += 5) {
			// 更新任务进度
			task.progress = progress;
			task.updatedAt = new Date().toISOString();

			// 保存任务更新
			await kv.put("task:" + taskId, JSON.stringify(task), {
				expirationTtl: 24 * 60 * 60, // 24小时
			});

			console.log("📊 食材 " + ingredient.name + " 进度: " + progress + "%");

			// 如果没有完成，等待下一个更新间隔
			if (progress < 100) {
				await new Promise((resolve) => setTimeout(resolve, updateInterval));
			}
		}

		// 最终处理结果
		const isSuccess = Math.random() > ingredient.failureRate;

		if (isSuccess) {
			task.status = "completed";
			task.endTime = new Date().toISOString();
			console.log("🎉 食材 " + ingredient.name + " 加工成功！");
		} else {
			// 失败处理
			if (task.retryCount < task.maxRetries) {
				task.retryCount++;
				task.progress = 0;
				task.status = "processing";
				task.startTime = new Date().toISOString();

				console.log(
					"🔄 食材 " +
						ingredient.name +
						" 加工失败，第 " +
						task.retryCount +
						" 次重试",
				);

				// 重新发送到队列进行重试
				await env.QUEUES.send({
					taskId: task.id,
					action: "process_ingredient",
					ingredient: task.ingredient,
					userId: task.userId,
					timestamp: task.updatedAt,
					retryCount: task.retryCount,
				});
			} else {
				task.status = "failed";
				task.endTime = new Date().toISOString();
				console.log("💥 食材 " + ingredient.name + " 加工最终失败");
			}
		}

		// 保存最终状态
		await kv.put("task:" + taskId, JSON.stringify(task), {
			expirationTtl: 24 * 60 * 60, // 24小时
		});
	} catch (error) {
		console.error("处理任务时发生错误:", error);

		// 尝试将任务标记为失败
		try {
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
		} catch (saveError) {
			console.error("保存失败状态时出错:", saveError);
		}
	}
}

// 导出默认消费者函数供 Cloudflare Workers 使用
export default {
	async queue(
		batch: MessageBatch<QueueMessage>,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		return queueConsumer(batch, env, ctx);
	},
};
