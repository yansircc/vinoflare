import { client } from "@/server/api";

import { createQueryKeys } from "@/lib/query-factory";
import { apiWrapperWithJson } from "@/utils/api-wrapper";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
	CreateTodoRequest,
	CreateTodoResponse,
	DeleteTodoResponse,
	GetTodoResponse,
	GetTodosResponse,
	UpdateTodoRequest,
	UpdateTodoResponse,
} from "./types";

// 创建 Query Keys
const todosKeys = createQueryKeys("todos");

// Hooks

// 获取所有待办事项
export const useTodos = () => {
	return useQuery({
		queryKey: todosKeys.all,
		queryFn: async () => {
			return apiWrapperWithJson<GetTodosResponse>(() =>
				client.todos.$get({ query: {} }),
			);
		},
	});
};

// 获取单个待办事项
export const useTodo = (id: string | number) => {
	return useQuery({
		queryKey: todosKeys.detail(id),
		queryFn: async () => {
			return apiWrapperWithJson<GetTodoResponse>(() =>
				client.todos[":id"].$get({
					param: { id: id.toString() },
				}),
			);
		},
		enabled: !!id,
	});
};

// 创建待办事项
export const useCreateTodo = () => {
	return useMutation<CreateTodoResponse, Error, CreateTodoRequest>({
		mutationFn: async (newTodo) => {
			return apiWrapperWithJson<CreateTodoResponse>(() =>
				client.todos.$post({ json: newTodo }),
			);
		},
		meta: {
			customSuccessMessage: "待办事项创建成功",
			customErrorMessage: "创建待办事项失败",
			invalidateQueries: {
				queryKey: todosKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 更新待办事项
export const useUpdateTodo = () => {
	return useMutation<
		UpdateTodoResponse,
		Error,
		{ id: string | number; data: UpdateTodoRequest }
	>({
		mutationFn: async ({ id, data }) => {
			return apiWrapperWithJson<UpdateTodoResponse>(() =>
				client.todos[":id"].$put({
					param: { id: id.toString() },
					json: data,
				}),
			);
		},
		meta: {
			customSuccessMessage: "待办事项更新成功",
			customErrorMessage: "更新待办事项失败",
			invalidateQueries: {
				queryKey: todosKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 删除待办事项
export const useDeleteTodo = () => {
	return useMutation<DeleteTodoResponse, Error, string | number>({
		mutationFn: async (id) => {
			return apiWrapperWithJson<DeleteTodoResponse>(() =>
				client.todos[":id"].$delete({
					param: { id: id.toString() },
				}),
			);
		},
		meta: {
			customSuccessMessage: "待办事项删除成功",
			customErrorMessage: "删除待办事项失败",
			invalidateQueries: {
				queryKey: todosKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 切换完成状态
export const useToggleTodo = () => {
	return useMutation<
		UpdateTodoResponse,
		Error,
		{ id: string | number; completed: boolean }
	>({
		mutationFn: async ({ id, completed }) => {
			return apiWrapperWithJson<UpdateTodoResponse>(() =>
				client.todos[":id"].$put({
					param: { id: id.toString() },
					json: { completed },
				}),
			);
		},
		meta: {
			customErrorMessage: "更新待办事项状态失败",
			invalidateQueries: {
				queryKey: todosKeys.all.map((key) => key.toString()),
			},
		},
	});
};
