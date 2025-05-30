import type { Ingredient } from "../api";
import { IngredientCard } from "./IngredientCard";

interface RandomIngredientsSectionProps {
	randomIngredients: Ingredient[];
	selectedIngredients: string[];
	onToggleIngredient: (ingredientId: string) => void;
	onGetRandomIngredients: () => void;
	onProcessIngredients: () => void;
	isRefreshPending: boolean;
	isProcessPending: boolean;
}

export function RandomIngredientsSection({
	randomIngredients,
	selectedIngredients,
	onToggleIngredient,
	onGetRandomIngredients,
	onProcessIngredients,
	isRefreshPending,
	isProcessPending,
}: RandomIngredientsSectionProps) {
	return (
		<div className="rounded-lg border border-gray-200 p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-medium text-gray-900 text-xl">🎲 随机食材</h2>
				<button
					type="button"
					onClick={onGetRandomIngredients}
					disabled={isRefreshPending}
					className="rounded-full bg-gray-900 px-4 py-2 font-medium text-sm text-white transition-all hover:scale-105 hover:bg-gray-700 disabled:opacity-50"
				>
					{isRefreshPending ? "获取中..." : "随机获得"}
				</button>
			</div>

			{randomIngredients.length > 0 ? (
				<div className="grid gap-3 sm:grid-cols-2">
					{randomIngredients.map((ingredient) => (
						<IngredientCard
							key={ingredient.id}
							ingredient={ingredient}
							isSelected={selectedIngredients.includes(ingredient.id)}
							onToggle={onToggleIngredient}
							size="large"
						/>
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
						onClick={onProcessIngredients}
						disabled={isProcessPending}
						className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
					>
						{isProcessPending
							? "提交中..."
							: `加工 ${selectedIngredients.length} 种食材`}
					</button>
				</div>
			)}
		</div>
	);
}
