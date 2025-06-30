import { createFileRoute } from "@tanstack/react-router";
import { TodoList } from "@/client/components/todo-list";
import { layout, spacing } from "@/client/lib/design";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className={spacing.page}>
			<div className={layout.narrow}>
				<TodoList />
			</div>
		</div>
	);
}
