import { TaskForm } from "@/hooks/tasks/ui/TaskForm";
import {
	useCreateTask,
	useDeleteTask,
	useTasks,
	useUpdateTask,
} from "@/hooks/tasks/use-tasks";
import type { Task } from "@/server/db/schema";
import { useState } from "react";

export function TasksList() {
	const [showForm, setShowForm] = useState(false);

	// 使用 TanStack Query hooks
	const { data: tasks, isLoading, isError } = useTasks();
	const deleteTaskMutation = useDeleteTask();
	const toggleTaskMutation = useUpdateTask();
	const createTaskMutation = useCreateTask();
	const updateTaskMutation = useUpdateTask();

	const handleDeleteTask = (id: number) => {
		deleteTaskMutation.mutate(id);
	};

	const handleToggleTask = (task: Task) => {
		toggleTaskMutation.mutate({
			id: task.id,
			task: { done: !task.done },
		});
	};

	const handleFormSuccess = () => {
		setShowForm(false);
	};

	if (isLoading) {
		return (
			<div className="p-8 text-center">
				<div className="text-gray-400">Loading...</div>
			</div>
		);
	}

	if (isError || !tasks) {
		return (
			<div className="p-8 text-center">
				<div className="text-gray-400">Unable to load tasks</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			{/* Header */}
			<div className="mb-8 text-center">
				<h1 className="mb-4 font-light text-2xl text-gray-800">Tasks</h1>
				<button
					type="button"
					onClick={() => setShowForm(!showForm)}
					className="text-gray-600 text-sm underline hover:text-gray-800"
				>
					{showForm ? "Cancel" : "+ Add Task"}
				</button>
			</div>

			{/* Add Task Form */}
			{showForm && (
				<div className="mb-8 rounded border border-gray-200 p-4">
					<TaskForm
						createTaskMutation={createTaskMutation}
						updateTaskMutation={updateTaskMutation}
						onSuccess={handleFormSuccess}
						onCancel={() => setShowForm(false)}
					/>
				</div>
			)}

			{/* Tasks List */}
			<div className="space-y-2">
				{!tasks || !Array.isArray(tasks) || tasks.length === 0 ? (
					<div className="py-12 text-center">
						<div className="text-gray-400">No tasks yet</div>
					</div>
				) : (
					tasks.map((task: Task) => (
						<div
							key={task.id}
							className="flex items-center gap-3 border-gray-100 border-b p-3 hover:bg-gray-50"
						>
							{/* Checkbox */}
							<button
								type="button"
								onClick={() => handleToggleTask(task)}
								className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-gray-300 hover:border-gray-400"
								aria-label={
									task.done ? "Mark as incomplete" : "Mark as complete"
								}
							>
								{task.done && (
									<svg
										className="h-3 w-3 text-gray-600"
										fill="currentColor"
										viewBox="0 0 20 20"
										aria-label="Mark as complete"
									>
										<title>Mark as complete</title>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								)}
							</button>

							{/* Task Name */}
							<div className="min-w-0 flex-1">
								<span
									className={`text-sm ${
										task.done ? "text-gray-400 line-through" : "text-gray-800"
									}`}
								>
									{task.name}
								</span>
							</div>

							{/* Delete Button */}
							<button
								type="button"
								onClick={() => handleDeleteTask(task.id)}
								className="flex-shrink-0 text-gray-400 text-xs hover:text-red-500"
							>
								×
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}
