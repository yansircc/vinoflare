import {
	animation,
	cn,
	colors,
	divider,
	focus,
	form,
	interactive,
	layout,
	states,
	text,
} from "@/client/lib/design";
import type { GetTodo200TodosItem } from "@/generated/schemas";

interface TodoItemProps {
	todo: GetTodo200TodosItem;
	index: number;
	onToggle: (todo: GetTodo200TodosItem) => void;
	onDelete: (id: number) => void;
	isUpdating: boolean;
	isDeleting: boolean;
}

export function TodoItem({
	todo,
	index,
	onToggle,
	onDelete,
	isUpdating,
	isDeleting,
}: TodoItemProps) {
	return (
		<li
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
				onClick={() => onToggle(todo)}
				className={cn(
					form.checkbox.base,
					todo.completed ? form.checkbox.checked : form.checkbox.unchecked,
					focus,
					isUpdating && states.pending,
				)}
				disabled={isUpdating}
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
				onClick={() => onDelete(todo.id)}
				className={cn(
					interactive.button.danger,
					focus,
					states.hidden,
					animation.fadeIn,
					isDeleting && states.pending,
				)}
				disabled={isDeleting}
			>
				{isDeleting ? "..." : "Delete"}
			</button>
		</li>
	);
}