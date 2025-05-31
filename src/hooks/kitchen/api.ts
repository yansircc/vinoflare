import { client } from "@/server/api";

import { createQueryKeys } from "@/lib/query-factory";
import { catchError } from "@/utils/catchError";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateVirtualProgress } from "./helper";

// 导入类型
import type {
	Ingredient,
	ProcessingStatus,
	ProcessingTask,
} from "@/server/routers/kitchen";

import type {
	ProcessIngredientsRequest,
	ProcessIngredientsResponse,
} from "./types";

// 创建 Query Keys
const kitchenKeys = createQueryKeys("kitchen");

// 获取所有可用食材
export const useIngredients = () => {
	return useQuery({
		queryKey: kitchenKeys.all,
		queryFn: async () => {
			const { data: result, error } = await catchError(async () => {
				const response = await client.kitchen.ingredients.$get();
				return response.json();
			});
			if (error || !result) {
				throw error;
			}
			return result;
		},
	});
};

// 获取用户的加工任务列表
export const useKitchenTasks = () => {
	return useQuery({
		queryKey: kitchenKeys.lists(),
		queryFn: async () => {
			const { data: result, error } = await catchError(async () => {
				const response = await client.kitchen.tasks.$get();
				return response.json();
			});
			if (error || !result) {
				throw error;
			}
			return result;
		},
	});
};

// 获取特定任务详情
export const useKitchenTask = (taskId: string) => {
	return useQuery({
		queryKey: kitchenKeys.detail(taskId),
		queryFn: async () => {
			const { data: result, error } = await catchError(async () => {
				const response = await client.kitchen.tasks[":taskId"].$get({
					param: { taskId },
				});
				return response.json();
			});
			if (error || !result) {
				throw error;
			}
			return result;
		},
		enabled: !!taskId,
	});
};

// 清除所有任务
export const useClearAllTasks = () => {
	return useMutation({
		mutationFn: async () => {
			await client.kitchen.tasks.$delete();
		},
		meta: {
			customSuccessMessage: "清除任务成功",
			customErrorMessage: "清除任务失败",
			optimisticUpdate: {
				queryKey: kitchenKeys.lists(),
				type: "delete",
			},
		},
	});
};

// 特殊操作：获取随机食材（保持原有逻辑）
export const useRandomIngredients = (count?: number) => {
	return useQuery({
		queryKey: kitchenKeys.list({ type: "randomIngredients", count }),
		queryFn: async () => {
			const { data: result, error } = await catchError(async () => {
				const response = await client.kitchen.randomIngredients.$get({
					query: count ? { count: count.toString() } : {},
				});
				return response.json();
			});
			if (error || !result) {
				throw error;
			}
			return result;
		},
		enabled: false, // 手动触发
	});
};

// 特殊操作：处理食材（发送到队列）
export const useProcessIngredients = () => {
	return useMutation<
		ProcessIngredientsResponse,
		Error,
		ProcessIngredientsRequest
	>({
		mutationFn: async (data) => {
			const { data: result, error } = await catchError(async () => {
				const response = await client.kitchen.process.$post({
					json: { ingredientIds: data.ingredientIds },
				});
				return response.json();
			});
			if (error || !result) {
				throw error;
			}
			return result;
		},
		meta: {
			customSuccessMessage: "提交加工任务成功",
			customErrorMessage: "提交加工任务失败",
			optimisticUpdate: {
				queryKey: kitchenKeys.lists(),
				type: "add",
			},
		},
	});
};

// 轮询更新 - 用于实时监控任务进度
export const useKitchenTasksPolling = (enabled = true, interval = 2000) => {
	const queryResult = useQuery({
		queryKey: kitchenKeys.lists(),
		queryFn: async () => {
			const { data: response, error } = await catchError(async () => {
				const result = await client.kitchen.tasks.$get();
				return result.json();
			});

			if (error || !response) {
				throw error;
			}

			// 为 processing 状态的任务计算虚拟进度
			const processedTasks = response.map((task) =>
				calculateVirtualProgress(task),
			);

			return processedTasks;
		},
		refetchInterval: (query) => {
			if (!enabled) return false;

			// 检查是否有进行中的任务
			const data = query.state.data;
			const hasActiveTasks = data?.some(
				(task) => task.status === "processing" || task.status === "pending",
			);

			// 如果有活跃任务，使用更快的轮询间隔
			if (hasActiveTasks) {
				return interval;
			}

			// 检查是否有刚完成的任务（需要显示100%状态）
			const hasRecentlyCompleted = data?.some((task) => {
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

// 手动刷新随机食材
export const useRefreshRandomIngredients = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (count?: number) => {
			const { data: result, error } = await catchError(async () => {
				const response = await client.kitchen.randomIngredients.$get({
					query: count ? { count: count.toString() } : {},
				});
				return response.json();
			});
			if (error || !result) {
				throw error;
			}
			return result;
		},
		onMutate: async (count) => {
			const queryKey = kitchenKeys.list({ type: "randomIngredients", count });

			// 取消进行中的查询
			await queryClient.cancelQueries({ queryKey });

			// 快照当前数据
			const previousData = queryClient.getQueryData(queryKey);

			// 乐观更新：显示加载占位符
			const placeholderCount = count || Math.floor(Math.random() * 5) + 1;
			const placeholderIngredients = Array.from(
				{ length: placeholderCount },
				(_, index) => ({
					id: `placeholder-${Date.now()}-${index}`,
					name: "获取中...",
					description: "正在获取随机食材",
					processingTime: 1000,
					failureRate: 0,
					emoji: "⏳",
				}),
			);

			queryClient.setQueryData(queryKey, placeholderIngredients);

			return { previousData, queryKey };
		},
		onError: (_error, _count, context) => {
			// 回滚到之前的数据
			if (context?.previousData && context?.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousData);
			}
		},
		onSuccess: (data, count) => {
			// 成功后，更新对应的 queryKey
			const queryKey = kitchenKeys.list({ type: "randomIngredients", count });
			queryClient.setQueryData(queryKey, data);
		},
		meta: {
			customErrorMessage: "获取随机食材失败",
		},
	});
};

// 导出类型供组件使用
export type { Ingredient, ProcessingTask, ProcessingStatus };
