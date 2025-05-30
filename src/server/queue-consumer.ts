import type { Ingredient, ProcessingTask } from "./routers/kitchen";

// 简化的队列消息类型
interface QueueMessage {
	taskId: string;
	ingredient: Ingredient;
	userId: string;
	timestamp: string;
}

// 队列消费者函数
export async function queueConsumer(
	batch: MessageBatch<QueueMessage>,
	env: Env,
	ctx: ExecutionContext,
): Promise<void> {
	console.log(`🍳 处理 ${batch.messages.length} 个队列消息`);
	console.log(`⏰ 队列处理开始时间: ${new Date().toISOString()}`);

	for (const message of batch.messages) {
		const { taskId, ingredient, userId } = message.body;

		try {
			console.log(`🥕 处理任务: ${ingredient.name} (ID: ${taskId})`);

			// 获取任务
			const task = await getTask(taskId, env);
			if (!task) {
				console.log(`❌ 任务 ${taskId} 不存在，跳过`);
				message.ack();
				continue;
			}

			// 只处理 pending 状态的任务
			if (task.status !== "pending") {
				console.log(`⏭️ 任务 ${taskId} 状态为 ${task.status}，跳过`);
				message.ack();
				continue;
			}

			// 检查是否有其他任务正在处理
			const hasProcessingTask = await hasOtherProcessingTask(
				taskId,
				userId,
				env,
			);
			if (hasProcessingTask) {
				console.log(`⏳ 用户 ${userId} 有其他任务正在处理，延迟 5 秒后重试`);
				// 重新排队，延迟 5 秒
				await env.QUEUES.send(message.body, { delaySeconds: 5 });
				message.ack();
				continue;
			}

			// 开始处理任务
			await processTask(task, env);
			message.ack();
		} catch (error) {
			console.error(`❌ 处理任务 ${taskId} 失败:`, error);
			await markTaskAsFailed(taskId, env);
			message.ack();
		}
	}

	console.log(`🏁 队列批处理完成: ${new Date().toISOString()}`);
}

// 获取任务
async function getTask(
	taskId: string,
	env: Env,
): Promise<ProcessingTask | null> {
	try {
		const task = (await env.KV.get(
			`task:${taskId}`,
			"json",
		)) as ProcessingTask | null;
		return task;
	} catch (error) {
		console.error(`获取任务 ${taskId} 失败:`, error);
		return null;
	}
}

// 检查是否有其他任务正在处理
async function hasOtherProcessingTask(
	currentTaskId: string,
	userId: string,
	env: Env,
): Promise<boolean> {
	try {
		const list = await env.KV.list({ prefix: "task:" });

		for (const key of list.keys) {
			const task = (await env.KV.get(
				key.name,
				"json",
			)) as ProcessingTask | null;
			if (!task || task.userId !== userId || task.id === currentTaskId) {
				continue;
			}

			if (task.status === "processing") {
				// 检查任务是否超时
				const isTimeout = await checkTaskTimeout(task, env);
				if (isTimeout) {
					console.log(`⚠️ 任务 ${task.id} 已超时，标记为失败`);
					await markTaskAsFailed(task.id, env);
					continue;
				}

				console.log(
					`🔍 发现正在处理的任务: ${task.ingredient.name} (ID: ${task.id})`,
				);
				return true;
			}
		}

		return false;
	} catch (error) {
		console.error("检查处理中任务失败:", error);
		return false;
	}
}

// 检查任务是否超时
async function checkTaskTimeout(
	task: ProcessingTask,
	env: Env,
): Promise<boolean> {
	if (!task.estimatedEndTime) {
		return true; // 没有预计结束时间的任务视为超时
	}

	const now = new Date();
	const estimatedEnd = new Date(task.estimatedEndTime);
	const timePastDeadline = now.getTime() - estimatedEnd.getTime();

	// 超过预计完成时间 30 秒认为超时
	return timePastDeadline > 30000;
}

// 处理任务
async function processTask(task: ProcessingTask, env: Env): Promise<void> {
	console.log(
		`🎯 开始处理任务: ${task.ingredient.name} (${task.ingredient.processingTime}秒)`,
	);

	try {
		// 设置任务为处理中状态
		const now = new Date();
		const estimatedEndTime = new Date(
			now.getTime() + task.ingredient.processingTime * 1000,
		);

		task.status = "processing";
		task.progress = 0;
		task.startTime = now.toISOString();
		task.estimatedEndTime = estimatedEndTime.toISOString();
		task.updatedAt = now.toISOString();

		await env.KV.put(`task:${task.id}`, JSON.stringify(task), {
			expirationTtl: 24 * 60 * 60,
		});

		console.log(
			`✅ 任务 ${task.id} 已开始处理，预计完成时间: ${estimatedEndTime.toISOString()}`,
		);

		// 使用 Durable Object 调度任务完成
		await scheduleTaskCompletion(task, env);
	} catch (error) {
		console.error(`处理任务 ${task.id} 时出错:`, error);
		await markTaskAsFailed(task.id, env);
		throw error;
	}
}

// 调度任务完成
async function scheduleTaskCompletion(
	task: ProcessingTask,
	env: Env,
): Promise<void> {
	// 使用 Cloudflare Workers 的 scheduled 功能或队列延迟消息
	const delaySeconds = Math.ceil(task.ingredient.processingTime);

	console.log(`⏰ 调度任务 ${task.id} 完成检查，延迟 ${delaySeconds} 秒`);

	// 发送延迟消息，使用特殊的 taskId 标识这是完成检查
	await env.QUEUES.send(
		{
			taskId: `complete:${task.id}`,
			ingredient: task.ingredient,
			userId: task.userId,
			timestamp: new Date().toISOString(),
		},
		{
			delaySeconds,
		},
	);
}

// 完成任务
async function completeTask(taskId: string, env: Env): Promise<void> {
	console.log(`🏁 检查任务完成: ${taskId}`);

	try {
		const task = await getTask(taskId, env);
		if (!task || task.status !== "processing") {
			console.log(`⏭️ 任务 ${taskId} 状态异常，跳过完成处理`);
			return;
		}

		// 随机决定是否成功
		const isSuccess = Math.random() > task.ingredient.failureRate;

		if (isSuccess) {
			// 成功
			task.status = "completed";
			task.progress = 100;
			task.endTime = new Date().toISOString();
			task.updatedAt = new Date().toISOString();

			await env.KV.put(`task:${task.id}`, JSON.stringify(task), {
				expirationTtl: 24 * 60 * 60,
			});

			console.log(`🎉 任务 ${task.id} (${task.ingredient.name}) 处理成功!`);
		} else {
			// 失败，检查是否需要重试
			if (task.retryCount < task.maxRetries) {
				task.retryCount++;
				task.status = "pending"; // 重新设为 pending，等待下次处理
				task.progress = 0;
				task.startTime = undefined;
				task.estimatedEndTime = undefined;
				task.updatedAt = new Date().toISOString();

				await env.KV.put(`task:${task.id}`, JSON.stringify(task), {
					expirationTtl: 24 * 60 * 60,
				});

				console.log(`🔄 任务 ${task.id} 失败，第 ${task.retryCount} 次重试`);

				// 重新排队
				await env.QUEUES.send(
					{
						taskId: task.id,
						ingredient: task.ingredient,
						userId: task.userId,
						timestamp: new Date().toISOString(),
					},
					{
						delaySeconds: 2, // 延迟 2 秒重试
					},
				);
			} else {
				// 达到最大重试次数，标记为失败
				task.status = "failed";
				task.endTime = new Date().toISOString();
				task.updatedAt = new Date().toISOString();

				await env.KV.put(`task:${task.id}`, JSON.stringify(task), {
					expirationTtl: 24 * 60 * 60,
				});

				console.log(`💥 任务 ${task.id} (${task.ingredient.name}) 最终失败`);
			}
		}
	} catch (error) {
		console.error(`完成任务 ${taskId} 时出错:`, error);
	}
}

// 标记任务为失败
async function markTaskAsFailed(taskId: string, env: Env): Promise<void> {
	try {
		const task = await getTask(taskId, env);
		if (task) {
			task.status = "failed";
			task.endTime = new Date().toISOString();
			task.updatedAt = new Date().toISOString();

			await env.KV.put(`task:${taskId}`, JSON.stringify(task), {
				expirationTtl: 24 * 60 * 60,
			});

			console.log(`❌ 任务 ${taskId} 已标记为失败`);
		}
	} catch (error) {
		console.error(`标记任务 ${taskId} 为失败时出错:`, error);
	}
}

// 默认导出，供 Cloudflare Workers 使用
export default {
	async queue(
		batch: MessageBatch<QueueMessage>,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		// 检查是否有完成检查消息
		const completionMessages = batch.messages.filter((msg) =>
			msg.body.taskId.startsWith("complete:"),
		);

		// 处理完成检查消息
		for (const message of completionMessages) {
			const actualTaskId = message.body.taskId.replace("complete:", "");
			await completeTask(actualTaskId, env);
			message.ack();
		}

		// 处理普通任务消息
		const normalMessages = batch.messages.filter(
			(msg) => !msg.body.taskId.startsWith("complete:"),
		);

		if (normalMessages.length > 0) {
			const normalBatch = {
				...batch,
				messages: normalMessages,
			};
			await queueConsumer(normalBatch, env, ctx);
		}
	},
};
