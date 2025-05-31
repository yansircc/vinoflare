import { PostsList } from "@/hooks/posts/ui/PostsList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/")({
	component: PostsList,
});
