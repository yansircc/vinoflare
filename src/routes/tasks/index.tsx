import { Explanation } from "@/components/Explanation";
import { PageHeader } from "@/components/PageHeader";
import { TasksList } from "@/hooks/tasks/ui/TaskList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/")({
	component: TasksPage,
});

function TasksPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-12">
			<PageHeader
				title="📝 待办事项"
				description={
					<>
						<p>
							体验 <span className="font-bold">CRUD</span> 操作的完整流程
						</p>
						<p>创建、读取、更新、删除待办事项，支持优先级和完成状态管理</p>
					</>
				}
			/>

			<TasksList />

			<Explanation
				title="💡 功能特性"
				items={[
					{
						title: "Cloudflare D1",
						description: "使用 Cloudflare D1 作为数据库",
						color: "bg-blue-500",
					},
					{
						title: "完整 CRUD",
						description: "支持创建、查看、编辑、删除待办事项",
						color: "bg-green-500",
					},
					{
						title: "实时同步",
						description: "使用 TanStack Query 实现数据缓存和同步",
						color: "bg-purple-500",
					},
				]}
			/>
		</div>
	);
}
