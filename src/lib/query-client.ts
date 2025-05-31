import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { HTTPException } from "hono/http-exception";
import { toast } from "sonner";

declare module "@tanstack/react-query" {
	interface Register {
		mutationMeta: {
			invalidateQueries?: {
				queryKey: string[];
			};
			customSuccessMessage?: string;
			customErrorMessage?: string;
		};
	}
}

export const queryClient = new QueryClient({
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
		onSuccess: (_data, _variables, _context, mutation) => {
			if (mutation.meta?.customSuccessMessage) {
				toast.success(mutation.meta.customSuccessMessage);
			}
		},
		onError: (error, _variables, _context, mutation) => {
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
			if (mutation.meta?.invalidateQueries) {
				queryClient.invalidateQueries({
					queryKey: mutation.meta.invalidateQueries.queryKey,
				});
			}
		},
	}),
});
