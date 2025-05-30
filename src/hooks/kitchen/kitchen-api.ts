import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "../../api/client";
import { authenticatedClient } from "../../lib/auth";
import { createQueryKeys } from "../../lib/query-factory";
import { catchError } from "../../utils/catchError";

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
} from "./kitchen-types";

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
export const useKitchenTasksPolling = (enabled = true, interval = 3000) => {
	const queryResult = useQuery({
		queryKey: kitchenKeys.lists(),
		queryFn: async (): Promise<GetTasksResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.kitchen.tasks.$get();
			});
			if (error || !result) {
				throw new Error("获取任务列表失败");
			}
			return await result.json();
		},
		refetchInterval: (query) => {
			if (!enabled) return false;

			// 检查是否有进行中的任务
			const data = query.state.data;
			const hasProcessingTasks = data?.data?.some(
				(task) => task.status === "processing" || task.status === "pending",
			);

			// 只有当有进行中的任务时才继续轮询
			return hasProcessingTasks ? interval : false;
		},
		refetchIntervalInBackground: enabled,
	});

	return queryResult;
};

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
