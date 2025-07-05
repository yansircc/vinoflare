import { cn, colors, divider, text } from "@/client/lib/design";
import type { SelectTodo } from "@/server/modules/todo/todo.schema";
import { TodoItem } from "./todo-item";

interface TodoListProps {
	todos: SelectTodo[];
	onToggle: (todo: SelectTodo) => void;
	onDelete: (id: number) => void;
	updatingIds: Set<number>;
	deletingIds: Set<number>;
}

export function TodoList({
	todos,
	onToggle,
	onDelete,
	updatingIds,
	deletingIds,
}: TodoListProps) {
	if (todos.length === 0) {
		return (
			<section className={cn(divider.section)}>
				<p className={cn(text.base, colors.text.muted)}>
					No todos yet. Add one above to get started.
				</p>
			</section>
		);
	}

	return (
		<section className={cn(divider.section)}>
			<ul className="space-y-0">
				{todos.map((todo, index) => (
					<TodoItem
						key={todo.id}
						todo={todo}
						index={index}
						onToggle={onToggle}
						onDelete={onDelete}
						isUpdating={updatingIds.has(todo.id)}
						isDeleting={deletingIds.has(todo.id)}
					/>
				))}
			</ul>
		</section>
	);
}
