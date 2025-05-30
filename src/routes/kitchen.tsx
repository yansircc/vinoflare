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
	KitchenHeader,
	RandomIngredientsSection,
	TaskQueueSection,
	WorkflowExplanation,
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
			<KitchenHeader />

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

			<WorkflowExplanation />
		</div>
	);
}
