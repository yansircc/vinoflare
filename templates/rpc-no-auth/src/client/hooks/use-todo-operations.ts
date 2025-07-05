import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { apiClient } from "@/generated/rpc-client";
import type { SelectTodo } from "@/server/modules/todo/todo.schema";

export function useTodoOperations() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [operations, setOperations] = useState({
		creating: false,
		updating: new Set<number>(),
		deleting: new Set<number>(),
	});

	const createTodo = async (title: string) => {
		setOperations((prev) => ({ ...prev, creating: true }));
		setError(null);

		try {
			const res = await apiClient.todo.$post({
				json: {
					title: title.trim(),
					completed: false,
				},
			});

			if (!res.ok) {
				throw new Error(`Failed to create todo: ${res.status}`);
			}

			// Invalidate router to refetch todos
			await router.invalidate();
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create todo");
			return false;
		} finally {
			setOperations((prev) => ({ ...prev, creating: false }));
		}
	};

	const toggleTodo = async (todo: SelectTodo) => {
		setOperations((prev) => ({
			...prev,
			updating: new Set([...prev.updating, todo.id]),
		}));
		setError(null);

		try {
			const res = await apiClient.todo[":id"].$put({
				param: { id: todo.id.toString() },
				json: {
					completed: !todo.completed,
				},
			});

			if (!res.ok) {
				throw new Error(`Failed to update todo: ${res.status}`);
			}

			// Invalidate router to refetch todos
			await router.invalidate();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update todo");
		} finally {
			setOperations((prev) => {
				const newUpdating = new Set(prev.updating);
				newUpdating.delete(todo.id);
				return { ...prev, updating: newUpdating };
			});
		}
	};

	const deleteTodo = async (id: number) => {
		setOperations((prev) => ({
			...prev,
			deleting: new Set([...prev.deleting, id]),
		}));
		setError(null);

		try {
			const res = await apiClient.todo[":id"].$delete({
				param: { id: id.toString() },
			});

			if (!res.ok) {
				throw new Error(`Failed to delete todo: ${res.status}`);
			}

			// Invalidate router to refetch todos
			await router.invalidate();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete todo");
		} finally {
			setOperations((prev) => {
				const newDeleting = new Set(prev.deleting);
				newDeleting.delete(id);
				return { ...prev, deleting: newDeleting };
			});
		}
	};

	return {
		error,
		operations,
		createTodo,
		toggleTodo,
		deleteTodo,
	};
}
