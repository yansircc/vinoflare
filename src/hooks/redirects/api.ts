import { client } from "@/server/api";

import {
	type PaginatedResponse,
	createCrudHooks,
	createQueryKeys,
} from "@/lib/query-factory";
import { useQuery } from "@tanstack/react-query";

import type {
	CreateRedirectRequest,
	Redirect,
	UpdateRedirectRequest,
} from "./types";

// 创建 Query Keys
const RedirectsKeys = createQueryKeys("redirects");

// 定义 API 接口
const redirectsApi = {
	getAll: async (filters?: {
		page?: number;
		limit?: number;
		sort?: "newest" | "oldest" | "visits";
	}): Promise<PaginatedResponse<Redirect>> => {
		const { page = 1, limit = 10, sort = "newest" } = filters || {};
		const response = await client.links.$get({
			query: {
				page: page.toString(),
				limit: limit.toString(),
				sort: sort as "newest" | "oldest" | "visits",
			},
		});
		return response.json();
	},

	getById: async (id: string | number): Promise<Redirect> => {
		const response = await client.links[":id"].$get({
			param: { id: id.toString() },
		});
		return response.json();
	},

	create: async (data: CreateRedirectRequest): Promise<Redirect> => {
		const response = await client.links.$post({ json: data });
		return response.json();
	},

	update: async (params: {
		id: string | number;
		data: UpdateRedirectRequest;
	}): Promise<Redirect> => {
		const response = await client.links[":id"].$put({
			param: { id: params.id.toString() },
			json: params.data,
		});
		return response.json();
	},

	delete: async (id: string | number): Promise<void> => {
		await client.links[":id"].$delete({
			param: { id: id.toString() },
		});
	},
};

// 使用 createCrudHooks 生成标准 CRUD 操作
const redirectsCrud = createCrudHooks({
	resource: "redirects",
	api: redirectsApi,
	getId: (item: Redirect) => item.id,
	messages: {
		createSuccess: "短链接创建成功",
		createError: "创建短链接失败",
		updateSuccess: "短链接更新成功",
		updateError: "更新短链接失败",
		deleteSuccess: "短链接删除成功",
		deleteError: "删除短链接失败",
	},
});

// 导出标准 CRUD 操作
export const useRedirects = redirectsCrud.useList;
export const useRedirect = redirectsCrud.useItem;
export const useCreateRedirect = redirectsCrud.useCreate;
export const useUpdateRedirect = redirectsCrud.useUpdate;
export const useDeleteRedirect = redirectsCrud.useDelete;

// 特殊操作：获取统计信息
export const useRedirectStats = () => {
	return useQuery({
		queryKey: RedirectsKeys.list({ type: "stats" }),
		queryFn: async () => {
			const response = await client.links.stats.$get();
			return response.json();
		},
	});
};
