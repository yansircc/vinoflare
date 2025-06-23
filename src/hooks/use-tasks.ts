import {
	useDeleteApiTasksId,
	useGetApiTasks,
	useGetApiTasksId,
	usePatchApiTasksId,
	usePostApiTasks,
} from "@/hooks/api/endpoints/tasks/tasks";
import type {
	PatchApiTasksIdBody,
	PostApiTasksBody,
} from "@/hooks/api/schemas";
import { useQueryClient } from "@tanstack/react-query";

// Wrapper hooks that provide a cleaner interface

export const useTasks = () => {
	const { data, isLoading, isError, error } = useGetApiTasks();

	return { data, isLoading, isError, error };
};

export const useTask = (id: number) => {
	const { data, isLoading, isError, error } = useGetApiTasksId(id, {
		query: {
			enabled: !!id,
		},
	});

	return { data, isLoading, isError, error };
};

export const useCreateTask = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, error } = usePostApiTasks({
		mutation: {
			onSuccess: () => {
				// Invalidate tasks cache after successful creation
				queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
			},
		},
	});

	// Return a simplified mutate function
	const createTask = (task: PostApiTasksBody) => {
		mutate({ data: task });
	};

	return { mutate: createTask, isPending, error };
};

export const useUpdateTask = () => {
	const queryClient = useQueryClient();

	const mutation = usePatchApiTasksId({
		mutation: {
			onSuccess: (_data, { id }) => {
				// Invalidate caches after successful update
				queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
				queryClient.invalidateQueries({ queryKey: [`/api/tasks/${id}`] });
			},
		},
	});

	// Wrap the mutate function to match the expected interface
	const updateTask = (params: { id: number; task: PatchApiTasksIdBody }) => {
		mutation.mutate({ id: params.id, data: params.task });
	};

	return {
		mutate: updateTask,
		isPending: mutation.isPending,
		error: mutation.error,
	};
};

export const useDeleteTask = () => {
	const queryClient = useQueryClient();

	const mutation = useDeleteApiTasksId({
		mutation: {
			onSuccess: (_data, { id }) => {
				// Invalidate caches after successful deletion
				queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
				queryClient.invalidateQueries({ queryKey: [`/api/tasks/${id}`] });
			},
		},
	});

	// Wrap the mutate function to match the expected interface
	const deleteTask = (id: number) => {
		mutation.mutate({ id });
	};

	return {
		mutate: deleteTask,
		isPending: mutation.isPending,
		error: mutation.error,
	};
};
