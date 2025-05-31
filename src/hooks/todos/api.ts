import { client } from "@/server/api";

import { createQueryKeys } from "@/lib/query-factory";
import { catchError } from "@/utils/catchError";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
		queryFn: async (): Promise<GetTodosResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.todos.$get({ query: {} });
			});

			if (error || !result) {
				throw new Error("获取待办事项失败");
			}
			return result.json();
		},
	});
};

// 获取单个待办事项
export const useTodo = (id: string | number) => {
	return useQuery({
		queryKey: todosKeys.detail(id),
		queryFn: async (): Promise<GetTodoResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.todos[":id"].$get({
					param: { id: id.toString() },
				});
			});
			if (error || !result) {
				throw new Error("获取待办事项失败");
			}
			return result.json();
		},
		enabled: !!id,
	});
};

// 创建待办事项
export const useCreateTodo = () => {
	const queryClient = useQueryClient();

	return useMutation<CreateTodoResponse, Error, CreateTodoRequest>({
		mutationFn: async (newTodo) => {
			const { data: result, error } = await catchError(async () => {
				const res = await client.todos.$post({ json: newTodo });
				return res.json();
			});
			if (error || !result) {
				throw new Error("创建待办事项失败");
			}
			return result;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: todosKeys.all });
			toast.success("待办事项创建成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 更新待办事项
export const useUpdateTodo = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateTodoResponse,
		Error,
		{ id: string | number; data: UpdateTodoRequest }
	>({
		mutationFn: async ({ id, data }) => {
			const { data: result, error } = await catchError(async () => {
				const res = await client.todos[":id"].$put({
					param: { id: id.toString() },
					json: data,
				});
				return res.json();
			});
			if (error || !result) {
				throw new Error("更新待办事项失败");
			}
			return result;
		},
		onSuccess: (data, variables) => {
			// 使列表失效
			queryClient.invalidateQueries({ queryKey: todosKeys.all });
			// 更新单个项目的缓存
			if (data) {
				queryClient.setQueryData(todosKeys.detail(variables.id), data);
			}
			toast.success("待办事项更新成功！");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 删除待办事项
export const useDeleteTodo = () => {
	const queryClient = useQueryClient();

	return useMutation<DeleteTodoResponse, Error, string | number>({
		mutationFn: async (id) => {
			const { data: result, error } = await catchError(async () => {
				const res = await client.todos[":id"].$delete({
					param: { id: id.toString() },
				});
				return res.json();
			});
			if (error || !result) {
				throw new Error("删除待办事项失败");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: todosKeys.all });
			toast.success("待办事项删除成功！");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 切换完成状态
export const useToggleTodo = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateTodoResponse,
		Error,
		{ id: string | number; completed: boolean }
	>({
		mutationFn: async ({ id, completed }) => {
			const { data: result, error } = await catchError(async () => {
				const res = await client.todos[":id"].$put({
					param: { id: id.toString() },
					json: { completed },
				});
				return res.json();
			});
			if (error || !result) {
				throw new Error("更新待办事项状态失败");
			}
			return result;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: todosKeys.all });
			if (data) {
				queryClient.setQueryData(todosKeys.detail(variables.id), data);
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
