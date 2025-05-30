import type { Ingredient } from "../api";

interface IngredientCardProps {
	ingredient: Ingredient;
	isSelected: boolean;
	onToggle: (ingredientId: string) => void;
	size?: "small" | "large";
}

export function IngredientCard({
	ingredient,
	isSelected,
	onToggle,
	size = "large",
}: IngredientCardProps) {
	const sizeClasses = size === "small" ? "text-xl" : "text-2xl";

	const textSizeClasses =
		size === "small"
			? "text-sm font-medium text-gray-700"
			: "font-medium text-gray-900";

	return (
		<button
			type="button"
			className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
				isSelected
					? "border-blue-500 bg-blue-50"
					: "border-gray-200 hover:border-gray-300"
			}`}
			onClick={() => onToggle(ingredient.id)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggle(ingredient.id);
				}
			}}
		>
			<div className="flex items-center gap-3">
				<span className={sizeClasses}>{ingredient.emoji}</span>
				<div className="flex-1">
					<div className={textSizeClasses}>{ingredient.name}</div>
					<div className="text-gray-500 text-xs">
						{ingredient.processingTime}秒 | 失败率{" "}
						{(ingredient.failureRate * 100).toFixed(1)}%
					</div>
				</div>
			</div>
		</button>
	);
}
