import type { NewTask, PatchTask } from "@/server/db/schema";
import { hcWithType } from "@/server/lib/hc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HTTPException } from "hono/http-exception";

const client = hcWithType("/api");

export const useTasks = () => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["tasks"],
		queryFn: async () => {
			const res = await client.tasks.$get();
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status, {
				message: `Failed to fetch tasks: ${res.statusText}`,
			});
		},
	});

	return { data, isLoading, isError, error, refetch };
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
			throw new HTTPException(res.status, {
				message: `Failed to fetch task: ${res.statusText}`,
			});
		},
		enabled: !!id,
	});

	return { data, isLoading, isError, error };
};

export const useCreateTask = () => {
	const { mutate, isPending, error } = useMutation({
		mutationFn: async (task: NewTask) => {
			const res = await client.tasks.$post({ json: task });
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status, {
				message: `Failed to create task: ${res.statusText}`,
			});
		},
	});

	return { mutate, isPending, error };
};

export const useUpdateTask = () => {
	const { mutate, isPending, error } = useMutation({
		mutationFn: async ({ id, task }: { id: number; task: PatchTask }) => {
			const res = await client.tasks[":id"].$patch({
				param: { id },
				json: task,
			});
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status, {
				message: `Failed to update task: ${res.statusText}`,
			});
		},
	});

	return { mutate, isPending, error };
};

export const useDeleteTask = () => {
	const { mutate, isPending, error } = useMutation({
		mutationFn: async (id: number) => {
			const res = await client.tasks[":id"].$delete({
				param: { id },
			});
			if (res.ok) {
				return res.json();
			}
			throw new HTTPException(res.status, {
				message: `Failed to delete task: ${res.statusText}`,
			});
		},
	});

	return { mutate, isPending, error };
};
