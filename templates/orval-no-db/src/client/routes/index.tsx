import { createFileRoute } from "@tanstack/react-router";
import { Hello } from "@/client/components/hello";
import { HelloError } from "@/client/components/hello-error";
import { HelloLoading } from "@/client/components/hello-loading";
import { customFetch } from "@/client/lib/custom-fetch";
import { layout, spacing } from "@/client/lib/design";
import type { GetHello200 } from "@/generated/schemas";

export const Route = createFileRoute("/")({
	// Load hello message before rendering the page
	loader: async () => {
		const response = await customFetch<{ data: GetHello200 }>("/api/hello", {
			method: "GET",
		});
		return response.data;
	},
	// Display while data is loading
	pendingComponent: HelloLoading,
	// Display when error occurs
	errorComponent: HelloError,
	// Main component
	component: HomePage,
});

function HomePage() {
	const data = Route.useLoaderData();

	return (
		<div className={spacing.page}>
			<div className={layout.narrow}>
				<div className="text-center">
					<Hello message={data.message} time={data.time} />
				</div>
			</div>
		</div>
	);
}
