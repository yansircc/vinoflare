import { Badge } from "@/components/ui/badge";
import type { ProcessingTask } from "../api";
import { TaskProgressBar } from "./TaskProgressBar";

interface TaskCardProps {
	task: ProcessingTask;
}

export function TaskCard({ task }: TaskCardProps) {
	const getStatusVariant = (status: ProcessingTask["status"]) => {
		switch (status) {
			case "pending":
				return "outline" as const;
			case "processing":
				return "default" as const;
			case "completed":
				return "secondary" as const;
			case "failed":
				return "destructive" as const;
			default:
				return "outline" as const;
		}
	};

	const getStatusText = (status: ProcessingTask["status"]) => {
		switch (status) {
			case "pending":
				return "等待中";
			case "processing":
				return "加工中";
			case "completed":
				return "已完成";
			case "failed":
				return "失败";
			default:
				return "未知";
		}
	};

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300">
			<div className="mb-2 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="text-xl">{task.ingredient.emoji}</span>
					<div>
						<div className="font-medium text-gray-900 text-sm">
							{task.ingredient.name}
						</div>
						<div className="text-gray-500 text-xs">
							重试 {task.retryCount}/{task.maxRetries}
						</div>
					</div>
				</div>
				<div>
					<Badge variant={getStatusVariant(task.status)}>
						{getStatusText(task.status)}
						{task.status === "pending" && (
							<span className="ml-1 animate-pulse">⏳</span>
						)}
						{task.status === "processing" && (
							<span className="ml-1 animate-spin">⚙️</span>
						)}
					</Badge>
				</div>
			</div>

			{task.status === "processing" && (
				<TaskProgressBar
					progress={task.progress}
					estimatedEndTime={task.estimatedEndTime}
				/>
			)}

			{task.status === "completed" && task.endTime && (
				<div className="mt-2 text-green-600 text-xs">
					✅ 完成于 {new Date(task.endTime).toLocaleTimeString()}
				</div>
			)}

			{task.status === "failed" && task.endTime && (
				<div className="mt-2 text-red-600 text-xs">
					❌ 失败于 {new Date(task.endTime).toLocaleTimeString()}
				</div>
			)}
		</div>
	);
}
