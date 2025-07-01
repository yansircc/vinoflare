import { createFileRoute } from "@tanstack/react-router";
import { Hello } from "@/client/components/hello";
import { layout, spacing } from "@/client/lib/design";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className={spacing.page}>
			<div className={layout.narrow}>
				<div className="text-center">
					<Hello />
				</div>
			</div>
		</div>
	);
}
