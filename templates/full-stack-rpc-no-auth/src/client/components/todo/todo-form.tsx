import { useState } from "react";
import { cn, focus, form, interactive, states } from "@/client/lib/design";

interface TodoFormProps {
	onSubmit: (title: string) => Promise<boolean>;
	isCreating: boolean;
}

export function TodoForm({ onSubmit, isCreating }: TodoFormProps) {
	const [title, setTitle] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		const success = await onSubmit(title);
		if (success) {
			setTitle("");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="What needs to be done?"
				className={cn(form.input.base, form.input.large, focus)}
				disabled={isCreating}
			/>
			<button
				type="submit"
				disabled={!title.trim() || isCreating}
				className={cn(
					interactive.button.primary,
					focus,
					(!title.trim() || isCreating) && states.disabled,
				)}
			>
				{isCreating ? "Adding..." : "Add Todo"}
			</button>
		</form>
	);
}
