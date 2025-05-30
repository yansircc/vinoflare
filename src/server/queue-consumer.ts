import type { Ingredient, ProcessingTask } from "./routers/kitchen";

// 队列消息类型
interface QueueMessage {
	taskId: string;
	action: "process_ingredient" | "update_progress";
	ingredient: Ingredient;
	userId: string;
	timestamp: string;
	retryCount?: number;
	currentProgress?: number; // 当前进度
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
			const {
				taskId,
				action,
				ingredient,
				userId,
				retryCount = 0,
				currentProgress = 0,
			} = message.body;

			if (action === "process_ingredient") {
				await handleProcessStart(taskId, ingredient, env);
			} else if (action === "update_progress") {
				await handleProgressUpdate(taskId, ingredient, currentProgress, env);
			}

			// 确认消息处理成功
			message.ack();
		} catch (error) {
			console.error("❌ 处理队列消息失败:", error);

			// 尝试将任务标记为失败
			try {
				await markTaskAsFailed(message.body.taskId, env);
			} catch (failError) {
				console.error("标记任务失败时出错:", failError);
			}

			message.ack(); // 确认消息以避免重复处理
		}
	}

	console.log("🏁 队列批处理完成时间:", new Date().toISOString());
}

// 处理任务开始
async function handleProcessStart(
	taskId: string,
	ingredient: Ingredient,
	env: Env,
): Promise<void> {
	const kv = env.KV;

	console.log(
		"🥕 开始处理食材: " + ingredient.name + " (任务ID: " + taskId + ")",
		"预计处理时间:",
		ingredient.processingTime + "秒",
	);

	// 获取当前任务
	const task = (await kv.get(
		"task:" + taskId,
		"json",
	)) as ProcessingTask | null;
	if (!task) {
		console.error("任务 " + taskId + " 不存在");
		return;
	}

	// 设置任务状态为 processing
	task.status = "processing";
	task.progress = 0;
	task.startTime = new Date().toISOString();
	task.updatedAt = new Date().toISOString();

	await kv.put("task:" + taskId, JSON.stringify(task), {
		expirationTtl: 24 * 60 * 60, // 24小时
	});

	// 立即发送第一个进度更新消息
	await scheduleNextProgressUpdate(taskId, ingredient, 0, env);

	console.log(
		"✅ 食材 " + ingredient.name + " 已开始处理 (任务ID: " + taskId + ")",
	);
}

// 处理进度更新
async function handleProgressUpdate(
	taskId: string,
	ingredient: Ingredient,
	currentProgress: number,
	env: Env,
): Promise<void> {
	const kv = env.KV;

	// 获取当前任务
	const task = (await kv.get(
		"task:" + taskId,
		"json",
	)) as ProcessingTask | null;
	if (!task || task.status !== "processing") {
		console.log("任务 " + taskId + " 已不存在或状态异常，停止处理");
		return;
	}

	const nextProgress = currentProgress + 5; // 每次增加5%
	task.progress = nextProgress;
	task.updatedAt = new Date().toISOString();

	console.log("📊 食材 " + ingredient.name + " 进度: " + nextProgress + "%");

	if (nextProgress >= 100) {
		// 任务完成，决定成功或失败
		await completeTask(task, ingredient, env);
	} else {
		// 保存当前进度
		await kv.put("task:" + taskId, JSON.stringify(task), {
			expirationTtl: 24 * 60 * 60,
		});

		// 调度下一次进度更新
		await scheduleNextProgressUpdate(taskId, ingredient, nextProgress, env);
	}
}

// 调度下一次进度更新
async function scheduleNextProgressUpdate(
	taskId: string,
	ingredient: Ingredient,
	currentProgress: number,
	env: Env,
): Promise<void> {
	const processingTime = ingredient.processingTime * 1000; // 转换为毫秒
	const updateInterval = Math.max(500, processingTime / 20); // 每5%更新一次，最少500ms
	const delaySeconds = Math.ceil(updateInterval / 1000); // 转换为秒

	// 发送延迟消息到队列
	await env.QUEUES.send(
		{
			taskId: taskId,
			action: "update_progress",
			ingredient: ingredient,
			userId: "", // 这里可以从task中获取
			timestamp: new Date().toISOString(),
			currentProgress: currentProgress,
		},
		{
			delaySeconds: delaySeconds,
		},
	);
}

// 完成任务
async function completeTask(
	task: ProcessingTask,
	ingredient: Ingredient,
	env: Env,
): Promise<void> {
	const kv = env.KV;

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
			task.startTime = new Date().toISOString();

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

			// 重新发送到队列进行重试
			await env.QUEUES.send({
				taskId: task.id,
				action: "process_ingredient",
				ingredient: task.ingredient,
				userId: task.userId,
				timestamp: task.updatedAt,
				retryCount: task.retryCount,
			});
			return; // 不要保存最终状态，因为要重试
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
		return queueConsumer(batch, env, ctx);
	},
};
