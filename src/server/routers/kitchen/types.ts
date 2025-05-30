// 食材类型定义
export interface Ingredient {
	id: string;
	name: string;
	emoji: string;
	processingTime: number; // 加工时长（秒）
	failureRate: number; // 失败率 (0-1)
	description: string;
}

// 加工任务状态
export type ProcessingStatus =
	| "pending"
	| "processing"
	| "completed"
	| "failed";

// 加工任务
export interface ProcessingTask {
	id: string;
	userId: string;
	ingredient: Ingredient;
	status: ProcessingStatus;
	startTime?: string;
	endTime?: string;
	estimatedEndTime?: string; // 预计完成时间，用于前端计算进度
	progress: number; // 0-100
	retryCount: number;
	maxRetries: number;
	createdAt: string;
	updatedAt: string;
}
