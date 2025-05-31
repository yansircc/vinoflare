import { RedirectsDetail } from "@/hooks/redirects/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/redirects/$id")({
	component: RedirectDetailPage,
});

function RedirectDetailPage() {
	const { id } = Route.useParams();
	return <RedirectsDetail id={id} />;
}
