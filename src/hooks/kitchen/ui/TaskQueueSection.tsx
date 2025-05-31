import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProcessingTask } from "../api";
import { TaskCard } from "./TaskCard";
import { TaskStatsGrid } from "./TaskStatsGrid";

interface TaskQueueSectionProps {
	tasks: ProcessingTask[];
	meta?: {
		totalCount: number;
		processingCount: number;
		completedCount: number;
		failedCount: number;
	};
	onClearAllTasks: () => void;
	isClearPending: boolean;
}

export function TaskQueueSection({
	tasks,
	meta,
	onClearAllTasks,
	isClearPending,
}: TaskQueueSectionProps) {
	const hasActiveTasks = tasks.some(
		(task) => task.status === "processing" || task.status === "pending",
	);

	return (
		<div className="rounded-lg border border-gray-200 p-6">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h2 className="font-medium text-gray-900 text-xl">⚡ 加工队列</h2>
					{tasks.length > 0 && (
						<span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs">
							{tasks.length} 个任务
						</span>
					)}
				</div>
				<div className="flex items-center gap-3">
					{hasActiveTasks ? (
						<div className="text-gray-500 text-sm">每 1 秒自动刷新</div>
					) : (
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="rounded-full bg-gray-600 px-3 py-1 font-medium text-white text-xs transition-all hover:bg-gray-700"
						>
							🔄 刷新
						</button>
					)}
					{tasks.length > 0 && (
						<button
							type="button"
							onClick={onClearAllTasks}
							disabled={isClearPending}
							className="rounded-full bg-red-600 px-3 py-1 font-medium text-white text-xs transition-all hover:bg-red-700 disabled:opacity-50"
						>
							{isClearPending ? "清除中..." : "🗑️ 清除所有"}
						</button>
					)}
				</div>
			</div>

			{tasks.length > 0 ? (
				<div className="space-y-4">
					<ScrollArea className="h-[500px] w-full rounded-md p-4">
						<div className="space-y-3">
							{tasks.map((task) => (
								<TaskCard key={task.id} task={task} />
							))}
						</div>
					</ScrollArea>
				</div>
			) : (
				<div className="py-8 text-center text-gray-500">
					<div className="mb-2 text-4xl">🍽️</div>
					<div>暂无加工任务</div>
					<div className="mt-1 text-xs">选择食材开始加工吧！</div>
				</div>
			)}

			{meta && <TaskStatsGrid meta={meta} />}
		</div>
	);
}
