import { cn, layout, spacing, text } from "@/client/lib/design";

export function HelloLoading() {
	return (
		<div className={spacing.page}>
			<div className={layout.narrow}>
				<div className="text-center">
					<div className={cn(text.display, "animate-pulse")}>Loading...</div>
				</div>
			</div>
		</div>
	);
}
