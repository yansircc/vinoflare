import { TaskDetail } from "@/ui/tasks/task-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/$id")({
	component: TaskDetailPage,
});

function TaskDetailPage() {
	const { id } = Route.useParams();
	return <TaskDetail id={Number(id)} />;
}
