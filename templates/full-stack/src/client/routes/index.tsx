import { PostsList } from "@client/components/posts-list";
import { createFileRoute } from "@tanstack/react-router";
import { layout, spacing } from "@/client/lib/design";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className={spacing.page}>
			<div className={layout.narrow}>
				<PostsList />
			</div>
		</div>
	);
}
