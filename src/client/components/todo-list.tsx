import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { cn, colors, focus, interactive, text } from "@/client/lib/design";
import {
	getGetTodoQueryKey,
	useDeleteTodoId,
	useGetTodo,
	usePostTodo,
	usePutTodoId,
} from "@/generated/endpoints/todo/todo";
import type { GetTodo200TodosItem } from "@/generated/schemas";

export function TodoList() {
	const [title, setTitle] = useState("");
	const queryClient = useQueryClient();

	// Queries
	const { data: todosData, isLoading, error } = useGetTodo();

	// Mutations
	const createTodo = usePostTodo({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: getGetTodoQueryKey() });
			},
		},
	});

	const deleteTodo = useDeleteTodoId({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: getGetTodoQueryKey() });
			},
		},
	});

	const updateTodo = usePutTodoId({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: getGetTodoQueryKey() });
			},
		},
	});

	// Clear the input when todo is successfully created
	useEffect(() => {
		if (createTodo.isSuccess) {
			setTitle("");
		}
	}, [createTodo.isSuccess]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		createTodo.mutate({
			data: {
				title: title.trim(),
				userId: "demo-user", // In a real app, this would come from auth context
			},
		});
	};

	const handleDelete = (id: number) => {
		deleteTodo.mutate({ id });
	};

	const handleToggleComplete = (todo: GetTodo200TodosItem) => {
		updateTodo.mutate({
			id: todo.id,
			data: {
				completed: !todo.completed,
			},
		});
	};

	// Extract the rendering logic for the todos section
	const renderTodos = () => {
		if (isLoading) {
			return <p className={cn(text.base, colors.text.secondary)}>Loading...</p>;
		}

		if (error) {
			return (
				<p className={cn(text.base, "text-red-600")}>Failed to load todos</p>
			);
		}

		const todos = todosData?.data?.todos || [];

		if (todos.length === 0) {
			return (
				<p className={cn(text.base, colors.text.secondary)}>No todos yet.</p>
			);
		}

		return (
			<ul className="space-y-4">
				{todos.map((todo) => (
					<li
						key={todo.id}
						className={cn(
							"flex items-center gap-3",
							"border-gray-100 border-b py-3",
							"group",
						)}
					>
						<button
							type="button"
							onClick={() => handleToggleComplete(todo)}
							className={cn(
								"relative h-5 w-5",
								"border-0 border-b-2",
								todo.completed
									? "border-gray-900"
									: "border-gray-300 hover:border-gray-600",
								"transition-all duration-200",
								focus,
								"focus:border-gray-900",
								"group/checkbox",
							)}
							disabled={updateTodo.isPending}
							aria-label={
								todo.completed ? "Mark as incomplete" : "Mark as complete"
							}
						>
							<span
								className={cn(
									"absolute inset-0 flex items-center justify-center",
									"transition-all duration-200",
									todo.completed
										? "scale-100 opacity-100"
										: "scale-75 opacity-0",
								)}
							>
								<svg
									viewBox="0 0 16 16"
									className="h-3.5 w-3.5"
									aria-hidden="true"
								>
									<path
										fill="currentColor"
										d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
									/>
								</svg>
							</span>
						</button>
						<div className="flex-1">
							<p
								className={cn(
									text.base,
									todo.completed && "text-gray-500 line-through",
								)}
							>
								{todo.title}
							</p>
						</div>
						<button
							type="button"
							onClick={() => handleDelete(todo.id)}
							className={cn(
								"px-3 py-1",
								text.small,
								"text-red-600 hover:text-red-700",
								"opacity-0 group-hover:opacity-100",
								"transition-opacity",
								focus,
							)}
							disabled={deleteTodo.isPending}
						>
							{deleteTodo.isPending ? "..." : "Delete"}
						</button>
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className="space-y-12">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<h2 className={cn(text.h2, "mb-2")}>Create Todo</h2>
				</div>

				<div className="space-y-4">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="What needs to be done?"
						className={cn(
							"w-full px-0 py-3",
							"border-0 border-gray-200 border-b",
							"placeholder:text-gray-400",
							text.large,
							focus,
							"focus:border-gray-900",
						)}
					/>
				</div>

				<button
					type="submit"
					disabled={!title.trim() || createTodo.isPending}
					className={cn(
						"px-6 py-2.5",
						interactive.button.primary,
						focus,
						"disabled:cursor-not-allowed disabled:opacity-50",
					)}
				>
					{createTodo.isPending ? "Adding..." : "Add Todo"}
				</button>
			</form>

			<div className="border-gray-100 border-t pt-12">
				<h2 className={cn(text.h2, "mb-8")}>Your Todos</h2>
				{renderTodos()}
			</div>
		</div>
	);
}
