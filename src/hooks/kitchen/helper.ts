import type { ProcessingTask } from "@/server/routers/kitchen";

// 计算虚拟进度的辅助函数
export function calculateVirtualProgress(task: ProcessingTask): ProcessingTask {
	// 对于已完成和失败的任务，如果有结束时间但没有显示过100%，先显示100%
	if (
		(task.status === "completed" || task.status === "failed") &&
		task.endTime
	) {
		// 检查是否刚完成（在最近3秒内完成）
		const endTime = new Date(task.endTime);
		const now = new Date();
		const timeSinceCompletion = now.getTime() - endTime.getTime();

		// 如果在最近1秒内完成，显示100%进度
		if (timeSinceCompletion < 1000) {
			return { ...task, progress: 100, status: "processing" }; // 临时保持processing状态显示100%
		}

		// 否则显示真实的完成状态
		return { ...task, progress: 100 };
	}

	// 只对 processing 状态的任务计算虚拟进度
	if (
		task.status !== "processing" ||
		!task.startTime ||
		!task.estimatedEndTime
	) {
		return task;
	}

	const now = new Date();
	const startTime = new Date(task.startTime);
	const endTime = new Date(task.estimatedEndTime);

	const totalDuration = endTime.getTime() - startTime.getTime();
	const elapsedTime = now.getTime() - startTime.getTime();

	if (elapsedTime <= 0) {
		// 还没开始
		return { ...task, progress: 1 }; // 开始时显示1%表示已启动
	}

	if (elapsedTime >= totalDuration) {
		// 已经到达预计完成时间，显示100%
		return { ...task, progress: 100 };
	}

	// 计算基础进度百分比
	let baseProgress = (elapsedTime / totalDuration) * 95; // 基础进度最大95%

	// 在75%之后减慢进度增长，让用户有更多时间看到接近完成的过程
	if (baseProgress > 75) {
		const remainingProgress = baseProgress - 75;
		const slowedProgress = 75 + remainingProgress * 0.6; // 最后25%的进度减慢40%
		baseProgress = slowedProgress;
	}

	// 添加一些自然变化
	// 使用任务ID作为种子保证同一任务的进度曲线一致
	const seed = Number.parseInt(task.id.slice(-6), 36) % 100;
	const variance = Math.sin(elapsedTime / 1000 + seed) * 1.5; // 1.5%的波动

	// 计算最终进度，在预计完成时间前最高到95%，到达预计时间后显示100%
	const finalProgress = Math.floor(
		Math.max(1, Math.min(95, baseProgress + variance)),
	);

	return { ...task, progress: finalProgress };
}
