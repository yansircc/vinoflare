import { useRouter } from "@tanstack/react-router";
import {
	cn,
	focus,
	interactive,
	layout,
	spacing,
	text,
} from "@/client/lib/design";

interface TodoErrorProps {
	error: Error;
}

export function TodoError({ error }: TodoErrorProps) {
	const router = useRouter();

	return (
		<div className={spacing.page}>
			<div className={cn(layout.narrow, "space-y-12")}>
				<div className="rounded-lg border border-red-200 bg-red-50 p-6">
					<h2 className={cn(text.h3, "mb-2 text-red-800")}>
						Failed to Load Todos
					</h2>
					<p className={cn(text.base, "mb-4 text-red-700")}>
						{error.message || "An unexpected error occurred"}
					</p>
					<button
						type="button"
						onClick={() => router.invalidate()}
						className={cn(interactive.button.primary, focus)}
					>
						Try Again
					</button>
				</div>
			</div>
		</div>
	);
}