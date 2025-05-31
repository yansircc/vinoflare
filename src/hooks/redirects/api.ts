import { client } from "@/server/api";

import { createQueryKeys } from "@/lib/query-factory";
import { apiWrapperWithJson } from "@/utils/api-wrapper";
import { useMutation, useQuery } from "@tanstack/react-query";

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
		queryFn: async () => {
			return apiWrapperWithJson<GetRedirectsResponse>(() =>
				client.links.$get({
					query: {
						page: page.toString(),
						limit: limit.toString(),
						sort: sort as "newest" | "oldest" | "visits",
					},
				}),
			);
		},
	});
};

// 获取单个短链接
export const useRedirect = (id: string) => {
	return useQuery({
		queryKey: RedirectsKeys.detail(id),
		queryFn: async () => {
			return apiWrapperWithJson<GetRedirectResponse>(() =>
				client.links[":id"].$get({
					param: { id },
				}),
			);
		},
		enabled: !!id,
	});
};

// 获取统计信息
export const useRedirectStats = () => {
	return useQuery({
		queryKey: RedirectsKeys.list({ type: "stats" }),
		queryFn: async () => {
			return apiWrapperWithJson<GetStatsResponse>(() =>
				client.links.stats.$get(),
			);
		},
	});
};

// 创建短链接
export const useCreateRedirect = () => {
	return useMutation<CreateRedirectResponse, Error, CreateRedirectRequest>({
		mutationFn: async (newRedirect) => {
			return apiWrapperWithJson<CreateRedirectResponse>(() =>
				client.links.$post({ json: newRedirect }),
			);
		},
		meta: {
			customSuccessMessage: "短链接创建成功",
			customErrorMessage: "创建短链接失败",
			invalidateQueries: {
				queryKey: RedirectsKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 更新短链接
export const useUpdateRedirect = () => {
	return useMutation<
		UpdateRedirectResponse,
		Error,
		{ id: string; data: UpdateRedirectRequest }
	>({
		mutationFn: async ({ id, data }) => {
			return apiWrapperWithJson<UpdateRedirectResponse>(() =>
				client.links[":id"].$put({
					param: { id },
					json: data,
				}),
			);
		},
		meta: {
			customSuccessMessage: "短链接更新成功",
			customErrorMessage: "更新短链接失败",
			invalidateQueries: {
				queryKey: RedirectsKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 删除短链接
export const useDeleteRedirect = () => {
	return useMutation<DeleteRedirectResponse, Error, string>({
		mutationFn: async (id) => {
			return apiWrapperWithJson<DeleteRedirectResponse>(() =>
				client.links[":id"].$delete({
					param: { id },
				}),
			);
		},
		meta: {
			customSuccessMessage: "短链接删除成功",
			customErrorMessage: "删除短链接失败",
			invalidateQueries: {
				queryKey: RedirectsKeys.all.map((key) => key.toString()),
			},
		},
	});
};
