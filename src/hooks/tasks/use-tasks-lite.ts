// 使用轻量级客户端的 hooks，避免 Hono RPC 类型推断
import type { NewTask, PatchTask } from "@/server/db/schema";
import { apiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTasks = () => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["tasks"],
		queryFn: () => apiClient.tasks.list(),
	});

	return { data, isLoading, isError, error };
};

export const useTask = (id: number) => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["task", id],
		queryFn: () => apiClient.tasks.get(id),
		enabled: !!id,
	});

	return { data, isLoading, isError, error };
};

export const useCreateTask = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, error } = useMutation({
		mutationFn: (task: NewTask) => apiClient.tasks.create(task),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	return { mutate, isPending, error };
};

export const useUpdateTask = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, error } = useMutation({
		mutationFn: ({ id, task }: { id: number; task: PatchTask }) =>
			apiClient.tasks.update(id, task),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["task", id] });
		},
	});

	return { mutate, isPending, error };
};

export const useDeleteTask = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, error } = useMutation({
		mutationFn: (id: number) => apiClient.tasks.delete(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["task", id] });
		},
	});

	return { mutate, isPending, error };
};