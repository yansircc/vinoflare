import { createFileRoute } from "@tanstack/react-router";
import { HelloDemo } from "@/client/components/hello-demo";
import { layout, spacing } from "@/client/lib/design";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className={spacing.page}>
			<div className={layout.narrow}>
				<HelloDemo />
			</div>
		</div>
	);
}
