import { client } from "@/server/api";

import {
	type PaginatedResponse,
	createCrudHooks,
	createQueryKeys,
} from "@/lib/query-factory";
import { catchError } from "@/utils/catchError";
import { useMutation } from "@tanstack/react-query";

import type {
	CreateTodoRequest,
	Todo,
	UpdateTodoRequest,
	UpdateTodoResponse,
} from "./types";

// 创建 Query Keys
const todosKeys = createQueryKeys("todos");

// 定义 API 接口
const todosApi = {
	getAll: async (filters?: {
		page?: number;
		limit?: number;
		sort?: "newest" | "oldest";
	}): Promise<PaginatedResponse<Todo>> => {
		const { page = 1, limit = 10, sort = "newest" } = filters || {};
		const response = await client.todos.$get({
			query: {
				page: page.toString(),
				limit: limit.toString(),
				sort: sort as "newest" | "oldest",
			},
		});
		return response.json();
	},

	getById: async (id: string | number) => {
		const response = await client.todos[":id"].$get({
			param: { id: id.toString() },
		});
		return response.json();
	},

	create: async (data: CreateTodoRequest) => {
		const response = await client.todos.$post({ json: data });
		return response.json();
	},

	update: async (params: {
		id: string | number;
		data: UpdateTodoRequest;
	}) => {
		const response = await client.todos[":id"].$put({
			param: { id: params.id.toString() },
			json: params.data,
		});
		return response.json();
	},

	delete: async (id: string | number) => {
		await client.todos[":id"].$delete({
			param: { id: id.toString() },
		});
	},
};

// 使用 createCrudHooks 生成标准 CRUD 操作
const todosCrud = createCrudHooks({
	resource: "todos",
	api: todosApi,
	getId: (item: Todo) => item.id,
	messages: {
		createSuccess: "待办事项创建成功",
		createError: "创建待办事项失败",
		updateSuccess: "待办事项更新成功",
		updateError: "更新待办事项失败",
		deleteSuccess: "待办事项删除成功",
		deleteError: "删除待办事项失败",
	},
});

// 导出标准 CRUD 操作
export const useTodos = todosCrud.useList;
export const useTodo = todosCrud.useItem;
export const useCreateTodo = todosCrud.useCreate;
export const useUpdateTodo = todosCrud.useUpdate;
export const useDeleteTodo = todosCrud.useDelete;

// 特殊操作：切换完成状态（保持原有逻辑）
export const useToggleTodo = () => {
	return useMutation<
		UpdateTodoResponse,
		Error,
		{ id: string | number; completed: boolean }
	>({
		mutationFn: async ({ id, completed }) => {
			const { data: result, error } = await catchError(async () => {
				const response = await client.todos[":id"].$put({
					param: { id: id.toString() },
					json: { completed },
				});
				return response.json();
			});
			if (error || !result) {
				throw error;
			}
			return result;
		},
		meta: {
			customErrorMessage: "更新待办事项状态失败",
			optimisticUpdate: {
				queryKey: todosKeys.all,
				type: "toggle",
				getId: (variables) => variables.id,
			},
		},
	});
};
