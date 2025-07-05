import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { APIError } from "./custom-fetch";

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
			// Handle special cases
			if (err instanceof APIError) {
				toast.error(err.message);
			} else {
				toast.error("An unexpected error occurred");
			}
		},
	}),
	mutationCache: new MutationCache({
		onError: (err) => {
			// Handle special cases
			if (err instanceof APIError) {
				toast.error(err.message);
			} else {
				toast.error("An unexpected error occurred");
			}
		},
	}),
});
