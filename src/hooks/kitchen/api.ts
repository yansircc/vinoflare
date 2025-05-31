import { client } from "@/server/api";

import { createQueryKeys } from "@/lib/query-factory";
import { apiWrapperWithJson } from "@/utils/api-wrapper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { calculateVirtualProgress } from "./helper";

// 导入类型
import type {
	Ingredient,
	ProcessingStatus,
	ProcessingTask,
} from "@/server/routers/kitchen";

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
		queryFn: async () => {
			return apiWrapperWithJson<GetIngredientsResponse>(() =>
				client.kitchen.ingredients.$get(),
			);
		},
	});
};

// 获取随机食材
export const useRandomIngredients = (count?: number) => {
	return useQuery({
		queryKey: kitchenKeys.list({ type: "randomIngredients", count }),
		queryFn: async () => {
			return apiWrapperWithJson<GetRandomIngredientsResponse>(() =>
				client.kitchen.randomIngredients.$get({
					query: count ? { count: count.toString() } : {},
				}),
			);
		},
		enabled: false, // 手动触发
	});
};

// 获取用户的加工任务列表
export const useKitchenTasks = () => {
	return useQuery({
		queryKey: kitchenKeys.lists(),
		queryFn: async () => {
			return apiWrapperWithJson<GetTasksResponse>(() =>
				client.kitchen.tasks.$get(),
			);
		},
	});
};

// 获取特定任务详情
export const useKitchenTask = (taskId: string) => {
	return useQuery({
		queryKey: kitchenKeys.detail(taskId),
		queryFn: async () => {
			return apiWrapperWithJson<GetTaskResponse>(() =>
				client.kitchen.tasks[":taskId"].$get({
					param: { taskId },
				}),
			);
		},
		enabled: !!taskId,
	});
};

// 处理食材（发送到队列）
export const useProcessIngredients = () => {
	return useMutation<
		ProcessIngredientsResponse,
		Error,
		ProcessIngredientsRequest
	>({
		mutationFn: async (data) => {
			return apiWrapperWithJson<ProcessIngredientsResponse>(() =>
				client.kitchen.process.$post({
					json: { ingredientIds: data.ingredientIds },
				}),
			);
		},
		meta: {
			customSuccessMessage: "提交加工任务成功",
			customErrorMessage: "提交加工任务失败",
			invalidateQueries: {
				queryKey: kitchenKeys.lists().map((key) => key.toString()),
			},
		},
	});
};

// 轮询更新 - 用于实时监控任务进度
export const useKitchenTasksPolling = (enabled = true, interval = 2000) => {
	const queryResult = useQuery({
		queryKey: kitchenKeys.lists(),
		queryFn: async () => {
			const response = await apiWrapperWithJson<GetTasksResponse>(() =>
				client.kitchen.tasks.$get(),
			);

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

// 手动刷新随机食材
export const useRefreshRandomIngredients = () => {
	return useMutation({
		mutationFn: async (count?: number) => {
			return apiWrapperWithJson<GetRandomIngredientsResponse>(() =>
				client.kitchen.randomIngredients.$get({
					query: count ? { count: count.toString() } : {},
				}),
			);
		},
		meta: {
			customErrorMessage: "获取随机食材失败",
			invalidateQueries: {
				queryKey: kitchenKeys
					.list({ type: "randomIngredients" })
					.map((key) => key.toString()),
			},
		},
	});
};

// 清除所有任务
export const useClearAllTasks = () => {
	return useMutation({
		mutationFn: async () => {
			return apiWrapperWithJson<ClearTasksResponse>(() =>
				client.kitchen.tasks.$delete(),
			);
		},
		meta: {
			customSuccessMessage: "清除任务成功",
			customErrorMessage: "清除任务失败",
			invalidateQueries: {
				queryKey: kitchenKeys.lists().map((key) => key.toString()),
			},
		},
	});
};

// 导出类型供组件使用
export type { Ingredient, ProcessingTask, ProcessingStatus };
