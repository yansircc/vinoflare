import { Explanation } from "@/components/Explanation";
import { PageHeader } from "@/components/PageHeader";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	type Ingredient,
	useClearAllTasks,
	useIngredients,
	useKitchenTasksPolling,
	useProcessIngredients,
	useRefreshRandomIngredients,
} from "../hooks/kitchen/api";
import {
	AllIngredientsSection,
	RandomIngredientsSection,
	TaskQueueSection,
} from "../hooks/kitchen/ui";

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

	return (
		<div className="mx-auto max-w-6xl space-y-12">
			<PageHeader
				title="🍳 智能厨房"
				description={
					<>
						<p>
							体验 Cloudflare Queues 的<span className="font-bold">生产者</span>
							和<span className="font-bold">消费者</span>模式
						</p>
						<p>每种食材都有不同的加工时长和失败率，失败后会自动重试</p>
					</>
				}
			/>

			<div className="grid gap-8 lg:grid-cols-2">
				{/* 左侧：食材选择 */}
				<div className="space-y-6">
					<RandomIngredientsSection
						randomIngredients={randomIngredients}
						selectedIngredients={selectedIngredients}
						onToggleIngredient={toggleIngredient}
						onGetRandomIngredients={handleGetRandomIngredients}
						onProcessIngredients={handleProcessIngredients}
						isRefreshPending={refreshRandomIngredients.isPending}
						isProcessPending={processIngredients.isPending}
					/>

					<AllIngredientsSection
						ingredients={allIngredients?.data || []}
						selectedIngredients={selectedIngredients}
						onToggleIngredient={toggleIngredient}
					/>
				</div>

				{/* 右侧：任务队列 */}
				<div className="space-y-6">
					<TaskQueueSection
						tasks={tasks?.data || []}
						meta={tasks?.meta}
						onClearAllTasks={() => clearAllTasks.mutate()}
						isClearPending={clearAllTasks.isPending}
					/>
				</div>
			</div>

			<Explanation
				title="💡 工作原理"
				items={[
					{
						title: "生产者",
						description: "用户选择食材，API 将任务发送到队列",
						color: "bg-blue-500",
					},
					{
						title: "队列处理",
						description: "Cloudflare Queues 异步处理任务",
						color: "bg-green-500",
					},
					{
						title: "消费者",
						description: "Worker 消费队列，更新进度和状态",
						color: "bg-purple-500",
					},
				]}
			/>
		</div>
	);
}
