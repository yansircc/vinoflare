import { cn, colors, layout, spacing, text } from "@/client/lib/design";

export function TodoLoading() {
	return (
		<div className={spacing.page}>
			<div className={cn(layout.narrow, "space-y-12")}>
				<section>
					<h1
						className={cn(text.h1, colors.text.primary, "mb-8 animate-pulse")}
					>
						Todo
					</h1>
					<div className="space-y-4">
						<div className="h-12 animate-pulse rounded bg-gray-200" />
						<div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
					</div>
				</section>
			</div>
		</div>
	);
}
