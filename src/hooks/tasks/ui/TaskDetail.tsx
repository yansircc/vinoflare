import { useGetApiTasksId } from "@/hooks/gen/tasks/tasks";
import { Link } from "@tanstack/react-router";

export function TaskDetail({ id }: { id: string }) {
	const {
		data: task,
		isLoading,
		isError,
		error,
	} = useGetApiTasksId(Number(id));

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
					加载失败: {error instanceof Error ? error.message : "未知错误"}
				</div>
			</div>
		);
	}

	if (!task) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-500">待办事项不存在</div>
			</div>
		);
	}

	const { name, done, createdAt, updatedAt } = task;

	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-10 text-center font-light text-2xl text-gray-900">
				待办事项详情
			</h1>

			{/* 待办事项内容 */}
			<div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
				{/* 头部信息 */}
				<div className="mb-6 border-gray-100 border-b pb-6">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h2
								className={`font-semibold text-xl ${
									done ? "text-gray-500 line-through" : "text-gray-900"
								}`}
							>
								{name}
							</h2>
							<div className="mt-2 flex items-center gap-3">
								{/* 完成状态 */}
								<span
									className={`flex items-center gap-1 text-sm ${
										done ? "text-green-600" : "text-gray-600"
									}`}
								>
									<svg
										className="h-4 w-4"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<title>{done ? "已完成" : "待办"}</title>
										{done ? (
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										) : (
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										)}
									</svg>
									{done ? "已完成" : "待办"}
								</span>
							</div>
						</div>
					</div>

					<div className="mt-4 text-gray-400 text-sm">
						创建于{" "}
						{createdAt
							? new Date(createdAt).toLocaleString("zh-CN", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
							: "未知时间"}
						{updatedAt && updatedAt !== createdAt && (
							<span className="ml-4">
								更新于{" "}
								{new Date(updatedAt).toLocaleString("zh-CN", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						)}
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="flex justify-end gap-3 pt-4">
					<Link
						to="/tasks"
						className="rounded-full border border-gray-300 px-6 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
					>
						返回列表
					</Link>
				</div>
			</div>

			{/* 相关信息 */}
			<div className="mt-8 text-center">
				<div className="text-gray-400 text-sm">待办事项 ID: {id}</div>
			</div>
		</div>
	);
}
