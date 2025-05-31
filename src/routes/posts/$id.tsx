import { PostDetail } from "@/hooks/posts/ui/PostDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$id")({
	component: PostDetailWrapper,
});

function PostDetailWrapper() {
	const { id } = Route.useParams();
	return <PostDetail id={id} />;
}
