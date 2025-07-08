import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { customFetch } from "@/client/lib/custom-fetch";
import type { GetTodo200TodosItem } from "@/generated/schemas";

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
			await customFetch("/api/todo", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
				}),
			});

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

	const toggleTodo = async (todo: GetTodo200TodosItem) => {
		setOperations((prev) => ({
			...prev,
			updating: new Set([...prev.updating, todo.id]),
		}));
		setError(null);

		try {
			await customFetch(`/api/todo/${todo.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					completed: !todo.completed,
				}),
			});

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
			await customFetch(`/api/todo/${id}`, {
				method: "DELETE",
			});

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
