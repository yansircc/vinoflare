import { createQueryKeys } from "@/lib/query-factory";
import { taskMutations, taskQueries } from "@/lib/task-queries";
// 最快的实现 - 完全不使用 Hono RPC
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const taskKeys = createQueryKeys("tasks");

export const useTasks = () => {
	return useQuery(taskQueries.all());
};

export const useTask = (id: number) => {
	return useQuery(taskQueries.detail(id));
};

export const useCreateTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		...taskMutations.create(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
};

export const useUpdateTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		...taskMutations.update(),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
		},
	});
};

export const useDeleteTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		...taskMutations.delete(),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
		},
	});
};
