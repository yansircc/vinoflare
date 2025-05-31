import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { HTTPException } from "hono/http-exception";
import { toast } from "sonner";

// 定义上下文类型
interface OptimisticContext {
	previousData: unknown;
	queryKey: string[];
}

declare module "@tanstack/react-query" {
	interface Register {
		mutationMeta: {
			invalidateQueries?: {
				queryKey: readonly string[] | string[];
			};
			customSuccessMessage?: string;
			customErrorMessage?: string;
			// 乐观更新配置
			optimisticUpdate?: {
				// 要更新的查询键
				queryKey: readonly string[] | string[];
				// 更新类型：add（添加）、update（更新）、delete（删除）、toggle（切换）
				type: "add" | "update" | "delete" | "toggle";
				// 获取 ID 的函数（用于 update、delete、toggle）
				getId?: (variables: any) => string | number;
				// 自定义更新函数（如果默认逻辑不够用）
				updater?: (oldData: any, variables: any, type: string) => any;
				// 生成乐观数据的函数（用于 add）
				generateOptimistic?: (variables: any) => any;
				// 是否自动处理 invalidate（默认 true）
				autoInvalidate?: boolean;
			};
		};
	}
}

// 先声明 queryClient 变量
const queryClient: QueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// 数据保持新鲜的时间（5分钟）
			staleTime: 1000 * 60 * 5,
			// 缓存时间（30分钟）
			gcTime: 1000 * 60 * 30,
			// 重试次数
			retry: false,
			// 重新获取配置
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
		},
		mutations: {
			// 变更重试次数
			retry: false,
		},
	},
	queryCache: new QueryCache({
		onError: (err) => {
			if (err instanceof HTTPException) {
				toast.error(err.message);
			}
		},
	}),
	mutationCache: new MutationCache({
		onMutate: async (
			variables,
			mutation,
		): Promise<OptimisticContext | undefined> => {
			const optimisticConfig = mutation.meta?.optimisticUpdate;
			if (!optimisticConfig) return;

			const { queryKey, type, getId, updater, generateOptimistic } =
				optimisticConfig;

			// 取消相关查询
			await queryClient.cancelQueries({ queryKey });

			// 快照当前数据
			const previousData: unknown = queryClient.getQueryData(queryKey);

			// 执行乐观更新
			queryClient.setQueryData(queryKey, (oldData: any) => {
				if (!oldData) return oldData;

				// 如果有自定义更新函数，使用它
				if (updater) {
					return updater(oldData, variables, type);
				}

				// 默认处理逻辑
				switch (type) {
					case "add": {
						const optimisticItem = generateOptimistic
							? generateOptimistic(variables)
							: {
									id: `temp-${Date.now()}`,
									...(typeof variables === "object" && variables !== null
										? variables
										: {}),
									createdAt: new Date().toISOString(),
									updatedAt: new Date().toISOString(),
								};
						return Array.isArray(oldData)
							? [...oldData, optimisticItem]
							: oldData;
					}

					case "update": {
						if (!getId) return oldData;
						const id = getId(variables);

						if (Array.isArray(oldData)) {
							return oldData.map((item: any) =>
								item.id?.toString() === id.toString()
									? {
											...item,
											...(typeof variables === "object" && variables !== null
												? variables
												: {}),
											updatedAt: new Date().toISOString(),
										}
									: item,
							);
						}
						return {
							...oldData,
							...(typeof variables === "object" && variables !== null
								? variables
								: {}),
							updatedAt: new Date().toISOString(),
						};
					}

					case "delete": {
						if (!getId) return oldData;
						const id = getId(variables);

						if (Array.isArray(oldData)) {
							return oldData.filter(
								(item: any) => item.id?.toString() !== id.toString(),
							);
						}
						return null;
					}

					case "toggle": {
						if (!getId) return oldData;
						const id = getId(variables);

						if (Array.isArray(oldData)) {
							return oldData.map((item: any) =>
								item.id?.toString() === id.toString()
									? {
											...item,
											...(typeof variables === "object" && variables !== null
												? variables
												: {}),
											updatedAt: new Date().toISOString(),
										}
									: item,
							);
						}
						return {
							...oldData,
							...(typeof variables === "object" && variables !== null
								? variables
								: {}),
							updatedAt: new Date().toISOString(),
						};
					}

					default:
						return oldData;
				}
			});

			// 返回上下文用于错误回滚
			return { previousData, queryKey: Array.from(queryKey) };
		},
		onSuccess: (_data, _variables, _context, mutation) => {
			if (mutation.meta?.customSuccessMessage) {
				toast.success(mutation.meta.customSuccessMessage);
			}
		},
		onError: (error, _variables, context, mutation) => {
			// 乐观更新回滚
			const ctx = context as OptimisticContext | undefined;
			if (ctx?.previousData && ctx?.queryKey) {
				queryClient.setQueryData(ctx.queryKey, ctx.previousData);
			}

			if (mutation.meta?.customErrorMessage) {
				toast.error(mutation.meta.customErrorMessage);
			} else {
				if (error instanceof Error) {
					toast.error(error.message);
					throw error.message;
				} else if (typeof error === "string") {
					toast.error(error);
					throw error;
				} else {
					toast.error("未知错误");
					throw new Error("未知错误");
				}
			}
		},
		onSettled: (_data, _error, _variables, _context, mutation) => {
			// 如果使用了乐观更新且启用了自动 invalidate，则自动处理
			const optimisticConfig = mutation.meta?.optimisticUpdate;
			if (optimisticConfig && optimisticConfig.autoInvalidate !== false) {
				queryClient.invalidateQueries({
					queryKey: optimisticConfig.queryKey,
				});
			}
			// 兼容手动配置的 invalidateQueries
			else if (mutation.meta?.invalidateQueries) {
				queryClient.invalidateQueries({
					queryKey: mutation.meta.invalidateQueries.queryKey,
				});
			}
		},
	}),
});

export { queryClient };
