import type { NewTask, PatchTask } from "@/server/db/schema";
import { createTypedClient } from "@/hooks/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HTTPException } from "hono/http-exception";

const client = createTypedClient("/").api;

export const useTasks = () => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["tasks"],
		queryFn: async () => {
			const res = await client.tasks.$get();

			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status as any, {
				message: `Failed to fetch tasks: ${res.statusText}`,
			});
		},
	});

	return { data, isLoading, isError, error };
};

export const useTask = (id: number) => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["task", id],
		queryFn: async () => {
			const res = await client.tasks[":id"].$get({
				param: { id },
			});
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status as any, {
				message: `Failed to fetch task: ${res.statusText}`,
			});
		},
		enabled: !!id,
	});

	return { data, isLoading, isError, error };
};

export const useCreateTask = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, error } = useMutation({
		mutationFn: async (task: NewTask) => {
			const res = await client.tasks.$post({ json: task });
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status as any, {
				message: `Failed to create task: ${res.statusText}`,
			});
		},
		onSuccess: () => {
			// 创建任务成功后失效 tasks 查询缓存
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	return { mutate, isPending, error };
};

export const useUpdateTask = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, error } = useMutation({
		mutationFn: async ({ id, task }: { id: number; task: PatchTask }) => {
			const res = await client.tasks[":id"].$patch({
				param: { id },
				json: task,
			});
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status as any, {
				message: `Failed to update task: ${res.statusText}`,
			});
		},
		onSuccess: (_data, { id }) => {
			// 更新任务成功后失效相关查询缓存
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["task", id] });
		},
	});

	return { mutate, isPending, error };
};

export const useDeleteTask = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, error } = useMutation({
		mutationFn: async (id: number) => {
			const res = await client.tasks[":id"].$delete({
				param: { id },
			});
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status as any, {
				message: `Failed to delete task: ${res.statusText}`,
			});
		},
		onSuccess: (_data, id) => {
			// 删除任务成功后失效相关查询缓存
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["task", id] });
		},
	});

	return { mutate, isPending, error };
};
