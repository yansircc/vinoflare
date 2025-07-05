import { createFileRoute } from "@tanstack/react-router";
import { cn, colors, layout, spacing, text } from "@/client/lib/design";
import { apiClient } from "@/generated/rpc-client";

export const Route = createFileRoute("/")({
	loader: async () => {
		const response = await apiClient.hello.$get();
		if (!response.ok) {
			throw new Error("Failed to fetch hello message");
		}
		const data = await response.json();
		return data;
	},
	component: HomePage,
});

function HomePage() {
	const data = Route.useLoaderData();

	return (
		<div className={spacing.page}>
			<div className={cn(layout.narrow, "space-y-12")}>
				<div className={cn(spacing.section, "text-center")}>
					<div className="space-y-4">
						<h1 className={cn(text.h1, colors.text.primary)}>{data.message}</h1>
						<p className={cn(text.large, colors.text.secondary)}>
							Message from API at: {new Date(data.time).toLocaleString()}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
