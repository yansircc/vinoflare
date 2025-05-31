import { TodoDetail } from "@/hooks/todos/ui/TodoDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/todos/$id")({
	component: TodoDetailPage,
});

function TodoDetailPage() {
	const { id } = Route.useParams();
	return <TodoDetail id={id} />;
}
