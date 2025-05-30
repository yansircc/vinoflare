import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	type Ingredient,
	type ProcessingTask,
	useClearAllTasks,
	useIngredients,
	useKitchenTasksPolling,
	useProcessIngredients,
	useRefreshRandomIngredients,
} from "../hooks/kitchen/kitchen-api";

export const Route = createFileRoute("/kitchen")({
	component: KitchenPage,
});

function KitchenPage() {
	const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
	const [randomIngredients, setRandomIngredients] = useState<Ingredient[]>([]);

	// API hooks
	const { data: allIngredients } = useIngredients();
	const { data: tasks } = useKitchenTasksPolling();
	const processIngredients = useProcessIngredients();
	const refreshRandomIngredients = useRefreshRandomIngredients();
	const clearAllTasks = useClearAllTasks();

	// 调试信息
	console.log("All ingredients:", allIngredients?.data?.slice(0, 2));

	const handleGetRandomIngredients = () => {
		const count = Math.floor(Math.random() * 5) + 1;
		refreshRandomIngredients.mutate(count, {
			onSuccess: (data) => {
				setRandomIngredients(data.data || []);
				setSelectedIngredients(data.data?.map((ing) => ing.id) || []);
			},
		});
	};

	const handleProcessIngredients = () => {
		if (selectedIngredients.length === 0) {
			toast.error("请先选择食材");
			return;
		}
		processIngredients.mutate({ ingredientIds: selectedIngredients });
		setSelectedIngredients([]);
		setRandomIngredients([]);
	};

	const toggleIngredient = (ingredientId: string) => {
		setSelectedIngredients((prev) =>
			prev.includes(ingredientId)
				? prev.filter((id) => id !== ingredientId)
				: [...prev, ingredientId],
		);
	};

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
		<div className="mx-auto max-w-6xl space-y-12">
			{/* 页面标题 */}
			<div className="space-y-4 text-center">
				<h1 className="font-bold text-4xl text-gray-900">🍳 智能厨房</h1>
				<p className="text-gray-600 text-xl">
					体验 Cloudflare Queues 的<span className="font-bold">生产者</span>和
					<span className="font-bold">消费者</span>模式
				</p>
				<p className="text-gray-500 text-sm">
					每种食材都有不同的加工时长和失败率，失败后会自动重试
				</p>
			</div>

			<div className="grid gap-8 lg:grid-cols-2">
				{/* 左侧：食材选择 */}
				<div className="space-y-6">
					{/* 随机获取食材 */}
					<div className="rounded-lg border border-gray-200 p-6">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-medium text-gray-900 text-xl">🎲 随机食材</h2>
							<button
								type="button"
								onClick={handleGetRandomIngredients}
								disabled={refreshRandomIngredients.isPending}
								className="rounded-full bg-gray-900 px-4 py-2 font-medium text-sm text-white transition-all hover:scale-105 hover:bg-gray-700 disabled:opacity-50"
							>
								{refreshRandomIngredients.isPending ? "获取中..." : "随机获得"}
							</button>
						</div>

						{randomIngredients.length > 0 ? (
							<div className="grid gap-3 sm:grid-cols-2">
								{randomIngredients.map((ingredient) => (
									<button
										key={ingredient.id}
										className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
											selectedIngredients.includes(ingredient.id)
												? "border-blue-500 bg-blue-50"
												: "border-gray-200 hover:border-gray-300"
										}`}
										onClick={() => toggleIngredient(ingredient.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												toggleIngredient(ingredient.id);
											}
										}}
										type="button"
									>
										<div className="flex items-center gap-3">
											<span className="text-2xl">{ingredient.emoji}</span>
											<div className="flex-1">
												<div className="font-medium text-gray-900">
													{ingredient.name}
												</div>
												<div className="text-gray-500 text-xs">
													{ingredient.processingTime}秒 | 失败率{" "}
													{(ingredient.failureRate * 100).toFixed(1)}%
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
						) : (
							<div className="py-8 text-center text-gray-500">
								点击"随机获得"来获取食材
							</div>
						)}

						{selectedIngredients.length > 0 && (
							<div className="mt-4 border-gray-200 border-t pt-4">
								<button
									type="button"
									onClick={handleProcessIngredients}
									disabled={processIngredients.isPending}
									className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
								>
									{processIngredients.isPending
										? "提交中..."
										: `加工 ${selectedIngredients.length} 种食材`}
								</button>
							</div>
						)}
					</div>

					{/* 所有食材列表 */}
					<div className="rounded-lg border border-gray-200 p-6">
						<h2 className="mb-4 font-medium text-gray-900 text-xl">
							📦 全部食材
						</h2>
						<div className="grid gap-2 sm:grid-cols-2">
							{allIngredients?.data?.map((ingredient) => (
								<button
									key={ingredient.id}
									className={`cursor-pointer rounded-lg border p-3 transition-all ${
										selectedIngredients.includes(ingredient.id)
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
									onClick={() => toggleIngredient(ingredient.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											toggleIngredient(ingredient.id);
										}
									}}
									type="button"
								>
									<div className="flex items-center gap-3">
										<span className="text-xl">{ingredient.emoji}</span>
										<div className="flex-1">
											<div className="font-medium text-gray-700 text-sm">
												{ingredient.name}
											</div>
											<div className="text-gray-500 text-xs">
												{ingredient.processingTime}秒 | 失败率{" "}
												{(ingredient.failureRate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* 右侧：任务队列 */}
				<div className="space-y-6">
					<div className="rounded-lg border border-gray-200 p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<h2 className="font-medium text-gray-900 text-xl">
									⚡ 加工队列
								</h2>
								{tasks?.data && tasks.data.length > 0 && (
									<span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs">
										{tasks.data.length} 个任务
									</span>
								)}
							</div>
							<div className="flex items-center gap-3">
								{tasks?.data &&
								tasks.data.some(
									(task) =>
										task.status === "processing" || task.status === "pending",
								) ? (
									<div className="text-gray-500 text-sm">每 3 秒自动刷新</div>
								) : (
									<button
										type="button"
										onClick={() => window.location.reload()}
										className="rounded-full bg-gray-600 px-3 py-1 font-medium text-white text-xs transition-all hover:bg-gray-700"
									>
										🔄 手动刷新
									</button>
								)}
								{tasks?.data && tasks.data.length > 0 && (
									<button
										type="button"
										onClick={() => clearAllTasks.mutate()}
										disabled={clearAllTasks.isPending}
										className="rounded-full bg-red-600 px-3 py-1 font-medium text-white text-xs transition-all hover:bg-red-700 disabled:opacity-50"
									>
										{clearAllTasks.isPending ? "清除中..." : "🗑️ 清除所有"}
									</button>
								)}
							</div>
						</div>

						{tasks?.data && tasks.data.length > 0 ? (
							<div className="space-y-4">
								<ScrollArea className="h-[500px] w-full rounded-md p-4">
									<div className="space-y-3">
										{tasks.data.map((task) => (
											<div
												key={task.id}
												className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300"
											>
												<div className="mb-2 flex items-center justify-between">
													<div className="flex items-center gap-3">
														<span className="text-xl">
															{task.ingredient.emoji}
														</span>
														<div>
															<div className="font-medium text-gray-900 text-sm">
																{task.ingredient.name}
															</div>
															<div className="text-gray-500 text-xs">
																重试 {task.retryCount}/{task.maxRetries}
															</div>
														</div>
													</div>
													<Badge variant={getStatusVariant(task.status)}>
														{getStatusText(task.status)}
													</Badge>
												</div>

												{task.status === "processing" && (
													<div className="mt-2">
														<div className="mb-1 flex items-center justify-between">
															<span className="text-gray-600 text-xs">
																进度
															</span>
															<span className="text-gray-600 text-xs">
																{task.progress}%
															</span>
														</div>
														<div className="h-2 w-full rounded-full bg-gray-200">
															<div
																className="h-2 rounded-full bg-blue-600 transition-all duration-500"
																style={{ width: `${task.progress}%` }}
															/>
														</div>
													</div>
												)}

												{task.status === "completed" && task.endTime && (
													<div className="mt-2 text-green-600 text-xs">
														✅ 完成于{" "}
														{new Date(task.endTime).toLocaleTimeString()}
													</div>
												)}

												{task.status === "failed" && task.endTime && (
													<div className="mt-2 text-red-600 text-xs">
														❌ 失败于{" "}
														{new Date(task.endTime).toLocaleTimeString()}
													</div>
												)}
											</div>
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

						{tasks?.meta && (
							<div className="mt-4 border-gray-200 border-t pt-4">
								<div className="grid grid-cols-4 gap-4 text-center">
									<div>
										<div className="font-medium text-gray-900">
											{tasks.meta.totalCount}
										</div>
										<div className="text-gray-500 text-xs">总任务</div>
									</div>
									<div>
										<div className="font-medium text-blue-600">
											{tasks.meta.processingCount}
										</div>
										<div className="text-gray-500 text-xs">进行中</div>
									</div>
									<div>
										<div className="font-medium text-green-600">
											{tasks.meta.completedCount}
										</div>
										<div className="text-gray-500 text-xs">已完成</div>
									</div>
									<div>
										<div className="font-medium text-red-600">
											{tasks.meta.failedCount}
										</div>
										<div className="text-gray-500 text-xs">失败</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 底部说明 */}
			<div className="rounded-lg bg-gray-50 p-6">
				<h3 className="mb-3 font-medium text-gray-900">💡 工作原理</h3>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="flex gap-3">
						<div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
						<div>
							<div className="font-medium text-gray-700 text-sm">生产者</div>
							<div className="text-gray-600 text-xs">
								用户选择食材，API 将任务发送到队列
							</div>
						</div>
					</div>
					<div className="flex gap-3">
						<div className="mt-2 h-2 w-2 rounded-full bg-green-500" />
						<div>
							<div className="font-medium text-gray-700 text-sm">队列处理</div>
							<div className="text-gray-600 text-xs">
								Cloudflare Queues 异步处理任务
							</div>
						</div>
					</div>
					<div className="flex gap-3">
						<div className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
						<div>
							<div className="font-medium text-gray-700 text-sm">消费者</div>
							<div className="text-gray-600 text-xs">
								Worker 消费队列，更新进度和状态
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
