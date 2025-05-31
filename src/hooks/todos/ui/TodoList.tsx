import { useDeleteTodo, useTodos, useToggleTodo } from "@/hooks/todos/api";
import { TodoForm } from "@/hooks/todos/ui/TodoForm";
import type { TodoSelect } from "@/server/db/types";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

// 优先级颜色映射
const priorityColors = {
	low: "bg-green-100 text-green-800",
	medium: "bg-yellow-100 text-yellow-800",
	high: "bg-red-100 text-red-800",
};

const priorityLabels = {
	low: "低",
	medium: "中",
	high: "高",
};

// 筛选选项
type FilterType = "all" | "pending" | "completed";

export function TodosList() {
	const [showForm, setShowForm] = useState(false);
	const [editingTodo, setEditingTodo] = useState<TodoSelect | null>(null);
	const [filter, setFilter] = useState<FilterType>("all");

	// 使用 TanStack Query hooks
	const { data: todos, isLoading, isError, error } = useTodos();
	const deleteTodoMutation = useDeleteTodo();
	const toggleTodoMutation = useToggleTodo();

	const handleDeleteTodo = async (id: number) => {
		if (!confirm("确定要删除这个待办事项吗？")) return;

		try {
			await deleteTodoMutation.mutateAsync(id);
		} catch (error) {
			console.error("Error deleting todo:", error);
		}
	};

	const handleEditTodo = (todo: TodoSelect) => {
		setEditingTodo(todo);
		setShowForm(false); // 关闭新建表单
	};

	const handleToggleTodo = async (todo: TodoSelect) => {
		try {
			await toggleTodoMutation.mutateAsync({
				id: todo.id,
				completed: !todo.completed,
			});
		} catch (error) {
			console.error("Error toggling todo:", error);
		}
	};

	const handleFormSuccess = () => {
		setShowForm(false);
		setEditingTodo(null);
	};

	const handleCancelEdit = () => {
		setEditingTodo(null);
	};

	// 筛选待办事项
	const filteredTodos =
		todos?.data.filter((todo) => {
			if (filter === "pending") return !todo.completed;
			if (filter === "completed") return todo.completed;
			return true;
		}) || [];

	// 按优先级和完成状态排序
	const sortedTodos = [...filteredTodos].sort((a, b) => {
		// 未完成的排在前面
		if (a.completed !== b.completed) {
			return a.completed ? 1 : -1;
		}
		// 按优先级排序
		const priorityOrder = { high: 0, medium: 1, low: 2 };
		return priorityOrder[a.priority] - priorityOrder[b.priority];
	});

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-red-500">
					加载失败: {error?.message || "未知错误"}
				</div>
			</div>
		);
	}

	if (!todos) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-500">暂无待办事项</div>
			</div>
		);
	}

	const completedCount = todos.data.filter((t) => t.completed).length;
	const pendingCount = todos.data.filter((t) => !t.completed).length;

	return (
		<div className="mx-auto max-w-4xl">
			{/* 头部 */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-light text-2xl text-gray-900">待办事项</h1>
					<p className="mt-1 text-gray-500 text-sm">
						共 {todos.data.length} 项，已完成 {completedCount} 项，待办{" "}
						{pendingCount} 项
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						setShowForm(!showForm);
						setEditingTodo(null); // 关闭编辑表单
					}}
					className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
				>
					{showForm ? "取消" : "新建待办事项"}
				</button>
			</div>

			{/* 筛选器 */}
			<div className="mb-6 flex gap-2">
				{[
					{ key: "all", label: "全部" },
					{ key: "pending", label: "待办" },
					{ key: "completed", label: "已完成" },
				].map((filterOption) => (
					<button
						key={filterOption.key}
						type="button"
						onClick={() => setFilter(filterOption.key as FilterType)}
						className={`rounded-full px-4 py-2 text-sm transition-colors ${
							filter === filterOption.key
								? "bg-gray-900 text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						{filterOption.label}
					</button>
				))}
			</div>

			{/* 创建表单 */}
			{showForm && (
				<div className="mb-8">
					<TodoForm
						onSuccess={handleFormSuccess}
						onCancel={() => setShowForm(false)}
					/>
				</div>
			)}

			{/* 编辑表单 */}
			{editingTodo && (
				<div className="mb-8">
					<div className="mb-4">
						<h2 className="font-medium text-gray-900 text-lg">编辑待办事项</h2>
					</div>
					<TodoForm
						initialData={editingTodo}
						onSuccess={handleFormSuccess}
						onCancel={handleCancelEdit}
					/>
				</div>
			)}

			{/* 待办事项列表 */}
			{sortedTodos.length === 0 ? (
				<div className="py-16 text-center">
					<div className="text-gray-400 text-lg">
						{filter === "all"
							? "暂无待办事项"
							: `暂无${filter === "pending" ? "待办" : "已完成"}事项`}
					</div>
					<p className="mt-2 text-gray-500 text-sm">
						{filter === "all"
							? "创建你的第一个待办事项吧"
							: "切换筛选条件查看其他事项"}
					</p>
					{filter === "all" && (
						<button
							type="button"
							onClick={() => setShowForm(true)}
							className="mt-4 rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700"
						>
							新建待办事项
						</button>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{sortedTodos.map((todo: TodoSelect) => (
						<div
							key={todo.id}
							className={`group rounded-lg border p-4 transition-all ${
								todo.completed
									? "border-gray-200 bg-gray-50"
									: "border-gray-200 bg-white hover:border-gray-300"
							}`}
						>
							<div className="flex items-start gap-3">
								{/* 完成状态复选框 */}
								<button
									type="button"
									onClick={() => handleToggleTodo(todo)}
									disabled={toggleTodoMutation.isPending}
									className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-gray-300 transition-colors hover:border-gray-400"
								>
									{todo.completed && (
										<svg
											className="h-3 w-3 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<title>已完成</title>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									)}
								</button>

								{/* 内容区域 */}
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<Link
												to="/todos/$id"
												params={{ id: todo.id.toString() }}
												className={`block font-medium transition-colors hover:text-blue-600 ${
													todo.completed
														? "text-gray-500 line-through"
														: "text-gray-900"
												}`}
											>
												{todo.title}
											</Link>
											{todo.description && (
												<p
													className={`mt-1 text-sm ${
														todo.completed ? "text-gray-400" : "text-gray-600"
													}`}
												>
													{todo.description.length > 100
														? `${todo.description.slice(0, 100)}...`
														: todo.description}
												</p>
											)}
										</div>

										{/* 优先级标签 */}
										<span
											className={`ml-2 rounded-full px-2 py-1 text-xs ${priorityColors[todo.priority]}`}
										>
											{priorityLabels[todo.priority]}
										</span>
									</div>

									{/* 元数据和操作 */}
									<div className="mt-3 flex items-center justify-between">
										<div className="text-gray-400 text-xs">
											创建于{" "}
											{todo.createdAt
												? new Date(todo.createdAt).toLocaleString("zh-CN")
												: "未知时间"}
											{todo.updatedAt && todo.updatedAt !== todo.createdAt && (
												<span className="ml-2">
													更新于{" "}
													{new Date(todo.updatedAt).toLocaleString("zh-CN")}
												</span>
											)}
										</div>

										{/* 操作按钮 */}
										<div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
											<Link
												to="/todos/$id"
												params={{ id: todo.id.toString() }}
												className="rounded px-2 py-1 text-gray-400 text-xs transition-all hover:bg-gray-100 hover:text-blue-600"
											>
												查看
											</Link>
											<button
												type="button"
												className="rounded px-2 py-1 text-gray-400 text-xs transition-all hover:bg-gray-100 hover:text-blue-600"
												onClick={() => handleEditTodo(todo)}
											>
												编辑
											</button>
											<button
												type="button"
												className="rounded px-2 py-1 text-gray-400 text-xs transition-all hover:bg-gray-100 hover:text-red-600"
												onClick={() => handleDeleteTodo(todo.id)}
												disabled={deleteTodoMutation.isPending}
											>
												删除
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
