import type { Ingredient } from "../api";
import { IngredientCard } from "./IngredientCard";

interface AllIngredientsSectionProps {
	ingredients: Ingredient[];
	selectedIngredients: string[];
	onToggleIngredient: (ingredientId: string) => void;
}

export function AllIngredientsSection({
	ingredients,
	selectedIngredients,
	onToggleIngredient,
}: AllIngredientsSectionProps) {
	return (
		<div className="rounded-lg border border-gray-200 p-6">
			<h2 className="mb-4 font-medium text-gray-900 text-xl">📦 全部食材</h2>
			<div className="grid gap-2 sm:grid-cols-2">
				{ingredients.map((ingredient) => (
					<IngredientCard
						key={ingredient.id}
						ingredient={ingredient}
						isSelected={selectedIngredients.includes(ingredient.id)}
						onToggle={onToggleIngredient}
						size="small"
					/>
				))}
			</div>
		</div>
	);
}
