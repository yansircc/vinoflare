import { client } from "@/server/api";

import { createQueryKeys } from "@/lib/query-factory";
import { catchError } from "@/utils/catchError";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
	CreateRedirectRequest,
	CreateRedirectResponse,
	DeleteRedirectResponse,
	GetRedirectResponse,
	GetRedirectsResponse,
	GetStatsResponse,
	UpdateRedirectRequest,
	UpdateRedirectResponse,
} from "./types";

// 创建 Query Keys
const RedirectsKeys = createQueryKeys("Redirects");

// 获取短链接列表
export const useRedirects = (
	params: {
		page?: number;
		limit?: number;
		sort?: "newest" | "oldest" | "visits";
	} = {},
) => {
	const { page = 1, limit = 10, sort = "newest" } = params;

	return useQuery({
		queryKey: RedirectsKeys.list({ page, limit, sort }),
		queryFn: async (): Promise<GetRedirectsResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.links.$get({
					query: {
						page: page.toString(),
						limit: limit.toString(),
						sort: sort as "newest" | "oldest" | "visits",
					},
				});
			});
			if (error || !result) {
				throw new Error("获取短链接列表失败");
			}
			return result.json();
		},
	});
};

// 获取单个短链接
export const useRedirect = (id: string) => {
	return useQuery({
		queryKey: RedirectsKeys.detail(id),
		queryFn: async (): Promise<GetRedirectResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.links[":id"].$get({
					param: { id },
				});
			});
			if (error || !result) {
				throw new Error("获取短链接失败");
			}
			return result.json();
		},
		enabled: !!id,
	});
};

// 获取统计信息
export const useRedirectStats = () => {
	return useQuery({
		queryKey: RedirectsKeys.list({ type: "stats" }),
		queryFn: async (): Promise<GetStatsResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.links.stats.$get();
			});
			if (error || !result) {
				throw new Error("获取统计信息失败");
			}
			return result.json();
		},
	});
};

// 创建短链接
export const useCreateRedirect = () => {
	const queryClient = useQueryClient();

	return useMutation<CreateRedirectResponse, Error, CreateRedirectRequest>({
		mutationFn: async (newRedirect) => {
			const { data: result, error } = await catchError(async () => {
				return await client.links.$post({ json: newRedirect });
			});
			if (error || !result) {
				throw new Error("创建短链接失败");
			}
			return result.json();
		},
		onSuccess: (data: CreateRedirectResponse) => {
			queryClient.invalidateQueries({ queryKey: RedirectsKeys.all });
			toast.success("短链接创建成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 更新短链接
export const useUpdateRedirect = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateRedirectResponse,
		Error,
		{ id: string; data: UpdateRedirectRequest }
	>({
		mutationFn: async ({ id, data }): Promise<UpdateRedirectResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.links[":id"].$put({
					param: { id },
					json: data,
				});
			});
			if (error || !result) {
				throw new Error("更新短链接失败");
			}
			return result.json();
		},
		onSuccess: (data: UpdateRedirectResponse, variables) => {
			queryClient.invalidateQueries({ queryKey: RedirectsKeys.all });
			queryClient.invalidateQueries({
				queryKey: RedirectsKeys.detail(variables.id),
			});
			toast.success("短链接更新成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 删除短链接
export const useDeleteRedirect = () => {
	const queryClient = useQueryClient();

	return useMutation<DeleteRedirectResponse, Error, string>({
		mutationFn: async (id: string): Promise<DeleteRedirectResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.links[":id"].$delete({
					param: { id },
				});
			});
			if (error || !result) {
				throw new Error("删除短链接失败");
			}
			return result.json();
		},
		onSuccess: (data: DeleteRedirectResponse) => {
			queryClient.invalidateQueries({ queryKey: RedirectsKeys.all });
			toast.success("短链接删除成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
