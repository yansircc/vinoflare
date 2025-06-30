import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	animation,
	cn,
	colors,
	divider,
	focus,
	focusVariants,
	form,
	interactive,
	layout,
	states,
	text,
} from "@/client/lib/design";
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
				userId: "demo-user",
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

	const todos = todosData?.data?.todos || [];

	return (
		<div className={cn(layout.narrow, "space-y-12")}>
			{/* Create Todo Form */}
			<section>
				<h1 className={cn(text.h1, colors.text.primary, "mb-8")}>Todo</h1>
				<form onSubmit={handleSubmit} className="space-y-6">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="What needs to be done?"
						className={cn(form.input.base, form.input.large, focus)}
						disabled={createTodo.isPending}
					/>
					<button
						type="submit"
						disabled={!title.trim() || createTodo.isPending}
						className={cn(interactive.button.primary, focus, states.disabled)}
					>
						{createTodo.isPending ? "Adding..." : "Add Todo"}
					</button>
				</form>
			</section>

			{/* Todos List */}
			<section className={cn(divider.section)}>
				{isLoading && (
					<p className={cn(text.base, colors.text.muted)}>Loading...</p>
				)}

				{!!error && (
					<p className={cn(text.base, text.error)}>Failed to load todos</p>
				)}

				{!isLoading && !error && todos.length === 0 && (
					<p className={cn(text.base, colors.text.muted)}>
						No todos yet. Add one above to get started.
					</p>
				)}

				{!isLoading && !error && todos.length > 0 && (
					<ul className="space-y-0">
						{todos.map((todo, index) => (
							<li
								key={todo.id}
								className={cn(
									layout.row,
									divider.light,
									"group py-4",
									index === 0 ? "border-t" : undefined,
								)}
							>
								{/* Checkbox */}
								<button
									type="button"
									onClick={() => handleToggleComplete(todo)}
									className={cn(
										form.checkbox.base,
										todo.completed
											? form.checkbox.checked
											: form.checkbox.unchecked,
										focusVariants.checkbox,
										updateTodo.isPending && states.pending,
									)}
									disabled={updateTodo.isPending}
									aria-label={
										todo.completed ? "Mark as incomplete" : "Mark as complete"
									}
								>
									<svg
										viewBox="0 0 16 16"
										className={cn(
											form.checkbox.icon,
											todo.completed
												? form.checkbox.iconVisible
												: form.checkbox.iconHidden,
											"text-white",
										)}
										aria-hidden="true"
									>
										<path
											fill="currentColor"
											d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
										/>
									</svg>
								</button>

								{/* Todo Content */}
								<div className="min-w-0 flex-1">
									<p
										className={cn(
											text.base,
											colors.text.primary,
											todo.completed && states.completed,
										)}
									>
										{todo.title}
									</p>
								</div>

								{/* Delete Button */}
								<button
									type="button"
									onClick={() => handleDelete(todo.id)}
									className={cn(
										interactive.button.danger,
										focus,
										states.hidden,
										animation.fadeIn,
										deleteTodo.isPending && states.pending,
									)}
									disabled={deleteTodo.isPending}
								>
									{deleteTodo.isPending ? "..." : "Delete"}
								</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
