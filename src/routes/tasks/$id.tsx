import { TaskDetail } from "@/hooks/tasks/ui/TaskDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/$id")({
	component: TaskDetailPage,
});

function TaskDetailPage() {
	const { id } = Route.useParams();
	return <TaskDetail id={Number(id)} />;
}
