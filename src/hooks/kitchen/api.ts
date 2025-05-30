import { client } from "@/api/client";
import { authenticatedClient } from "@/lib/auth";
import { createQueryKeys } from "@/lib/query-factory";
import { catchError } from "@/utils/catchError";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// 导入类型
import type {
	Ingredient,
	ProcessingStatus,
	ProcessingTask,
} from "../../server/routers/kitchen";

import type {
	ClearTasksResponse,
	GetIngredientsResponse,
	GetRandomIngredientsResponse,
	GetTaskResponse,
	GetTasksResponse,
	ProcessIngredientsRequest,
	ProcessIngredientsResponse,
} from "./types";

// 创建 Query Keys
const kitchenKeys = createQueryKeys("kitchen");

// 获取所有可用食材
export const useIngredients = () => {
	return useQuery({
		queryKey: kitchenKeys.all,
		queryFn: async (): Promise<GetIngredientsResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.kitchen.ingredients.$get();
			});
			if (error || !result) {
				throw new Error("获取食材列表失败");
			}
			return result.json();
		},
	});
};

// 获取随机食材
export const useRandomIngredients = (count?: number) => {
	return useQuery({
		queryKey: kitchenKeys.list({ type: "randomIngredients", count }),
		queryFn: async (): Promise<GetRandomIngredientsResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.kitchen.randomIngredients.$get({
					query: count ? { count: count.toString() } : {},
				});
			});
			if (error || !result) {
				throw new Error("获取随机食材失败");
			}
			return result.json();
		},
		enabled: false, // 手动触发
	});
};

// 获取用户的加工任务列表
export const useKitchenTasks = () => {
	return useQuery({
		queryKey: kitchenKeys.lists(),
		queryFn: async (): Promise<GetTasksResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.kitchen.tasks.$get();
			});
			if (error || !result) {
				throw new Error("获取任务列表失败");
			}
			return result.json();
		},
	});
};

// 获取特定任务详情
export const useKitchenTask = (taskId: string) => {
	return useQuery({
		queryKey: kitchenKeys.detail(taskId),
		queryFn: async (): Promise<GetTaskResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.kitchen.tasks[":taskId"].$get({
					param: { taskId },
				});
			});
			if (error || !result) {
				throw new Error("获取任务详情失败");
			}
			return result.json();
		},
		enabled: !!taskId,
	});
};

// 处理食材（发送到队列）
export const useProcessIngredients = () => {
	const queryClient = useQueryClient();

	return useMutation<
		ProcessIngredientsResponse,
		Error,
		ProcessIngredientsRequest
	>({
		mutationFn: async (data) => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.kitchen.process.$post({
					json: { ingredientIds: data.ingredientIds },
				});
			});

			if (error || !result) {
				throw new Error(error?.message || "提交加工任务失败");
			}

			return result.json();
		},
		onSuccess: (data) => {
			// 刷新任务列表
			queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });

			// 显示成功提示
			const taskCount = data.data.length || 0;
			toast.success(`成功提交 ${taskCount} 个食材加工任务`, {
				description: "任务已加入队列",
			});
		},
		onError: (error: Error) => {
			toast.error("提交加工任务失败", {
				description: error.message,
			});
		},
	});
};

// 轮询更新 - 用于实时监控任务进度
export const useKitchenTasksPolling = (enabled = true, interval = 2000) => {
	const queryResult = useQuery({
		queryKey: kitchenKeys.lists(),
		queryFn: async (): Promise<GetTasksResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.kitchen.tasks.$get();
			});
			if (error || !result) {
				throw new Error("获取任务列表失败");
			}
			const response = await result.json();

			// 为 processing 状态的任务计算虚拟进度
			if (response.data) {
				response.data = response.data.map((task) =>
					calculateVirtualProgress(task),
				);
			}

			return response;
		},
		refetchInterval: (query) => {
			if (!enabled) return false;

			// 检查是否有进行中的任务
			const data = query.state.data;
			const hasActiveTasks = data?.data?.some(
				(task) => task.status === "processing" || task.status === "pending",
			);

			// 如果有活跃任务，使用更快的轮询间隔
			if (hasActiveTasks) {
				return interval;
			}

			// 检查是否有刚完成的任务（需要显示100%状态）
			const hasRecentlyCompleted = data?.data?.some((task) => {
				if (
					(task.status === "completed" || task.status === "failed") &&
					task.endTime
				) {
					const timeSinceCompletion =
						new Date().getTime() - new Date(task.endTime).getTime();
					return timeSinceCompletion < 2000; // 最近2秒内完成的任务
				}
				return false;
			});

			if (hasRecentlyCompleted) {
				return 500; // 更快的轮询以显示100%状态
			}

			return false; // 没有活跃任务时停止轮询
		},
		refetchIntervalInBackground: enabled,
	});

	return queryResult;
};

// 计算虚拟进度的辅助函数
function calculateVirtualProgress(task: ProcessingTask): ProcessingTask {
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

// 手动刷新随机食材
export const useRefreshRandomIngredients = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			count?: number,
		): Promise<GetRandomIngredientsResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.kitchen.randomIngredients.$get({
					query: count ? { count: count.toString() } : {},
				});
			});
			if (error || !result) {
				throw new Error("获取随机食材失败");
			}
			return await result.json();
		},
		onSuccess: (data: GetRandomIngredientsResponse, count) => {
			// 更新缓存
			queryClient.setQueryData(
				kitchenKeys.list({ type: "randomIngredients", count }),
				data,
			);

			const ingredientCount = data.data?.length || 0;
			toast.success(`🎲 随机获得 ${ingredientCount} 种食材！`, {
				description: "可以开始加工了",
			});
		},
		onError: (error: Error) => {
			toast.error("获取随机食材失败", {
				description: error.message,
			});
		},
	});
};

// 清除所有任务
export const useClearAllTasks = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (): Promise<ClearTasksResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.kitchen.tasks.$delete();
			});

			if (error || !result) {
				throw new Error(error?.message || "清除任务失败");
			}

			return await result.json();
		},
		onSuccess: () => {
			// 刷新任务列表
			queryClient.invalidateQueries({ queryKey: kitchenKeys.lists() });

			// 显示成功提示
			toast.success("🗑️ 已清除所有任务", {
				description: "任务列表已重置",
			});
		},
		onError: (error: Error) => {
			toast.error("清除任务失败", {
				description: error.message,
			});
		},
	});
};

// 导出类型供组件使用
export type { Ingredient, ProcessingTask, ProcessingStatus };
