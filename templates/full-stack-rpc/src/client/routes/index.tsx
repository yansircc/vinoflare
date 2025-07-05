import { createFileRoute } from "@tanstack/react-router";
import { TodoError } from "@/client/components/todo/todo-error";
import { TodoForm } from "@/client/components/todo/todo-form";
import { TodoList } from "@/client/components/todo/todo-list";
import { TodoLoading } from "@/client/components/todo/todo-loading";
import { useTodoOperations } from "@/client/hooks/use-todo-operations";
import { cn, colors, layout, spacing, text } from "@/client/lib/design";
import { apiClient } from "@/generated/rpc-client";

export const Route = createFileRoute("/")({
	// Load todos data before rendering the page
	loader: async () => {
		const res = await apiClient.todo.$get();
		if (!res.ok) {
			throw new Error(`Failed to load todos: ${res.status}`);
		}
		const data = await res.json();
		return data.todos;
	},
	// Display while data is loading
	pendingComponent: TodoLoading,
	// Display when error occurs
	errorComponent: TodoError,
	// Main component
	component: HomePage,
});

function HomePage() {
	const todos = Route.useLoaderData();
	const { error, operations, createTodo, toggleTodo, deleteTodo } =
		useTodoOperations();

	return (
		<div className={spacing.page}>
			<div className={cn(layout.narrow, "space-y-12")}>
				{/* Header and Create Form */}
				<section>
					<h1 className={cn(text.h1, colors.text.primary, "mb-8")}>
						Todo (RPC)
					</h1>
					<TodoForm onSubmit={createTodo} isCreating={operations.creating} />
				</section>

				{/* Error Display */}
				{error && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4">
						<p className={cn(text.base, "text-red-800")}>
							<strong>Error:</strong> {error}
						</p>
					</div>
				)}

				{/* Todos List */}
				<TodoList
					todos={todos}
					onToggle={toggleTodo}
					onDelete={deleteTodo}
					updatingIds={operations.updating}
					deletingIds={operations.deleting}
				/>
			</div>
		</div>
	);
}
