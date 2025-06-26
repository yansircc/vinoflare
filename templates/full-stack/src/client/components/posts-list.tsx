import { useEffect, useState } from "react";
import { useCreatePost, useLatestPost } from "@/client/hooks/use-posts";
import { cn, colors, focus, interactive, text } from "@/client/lib/design";

export function PostsList() {
	const [title, setTitle] = useState("");
	const { post, isLoading, error } = useLatestPost();
	const { createPost, isCreating, isSuccess } = useCreatePost();

	// Clear the input when post is successfully created
	useEffect(() => {
		if (isSuccess) {
			setTitle("");
		}
	}, [isSuccess]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createPost(title);
	};

	return (
		<div className="space-y-12">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<h2 className={cn(text.h2, "mb-2")}>Create Post</h2>
					<p className={cn(text.base, colors.text.secondary)}>
						Share your thoughts with the world
					</p>
				</div>

				<div className="space-y-4">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="What's on your mind?"
						className={cn(
							"w-full px-0 py-3",
							"border-0 border-gray-200 border-b",
							"placeholder:text-gray-400",
							text.large,
							focus,
							"focus:border-gray-900",
						)}
					/>
				</div>

				<button
					type="submit"
					disabled={!title.trim() || isCreating}
					className={cn(
						"px-6 py-2.5",
						interactive.button.primary,
						focus,
						"disabled:cursor-not-allowed disabled:opacity-50",
					)}
				>
					{isCreating ? "Publishing..." : "Publish"}
				</button>
			</form>

			<div className="border-gray-100 border-t pt-12">
				<h2 className={cn(text.h2, "mb-8")}>Latest Post</h2>

				{isLoading ? (
					<p className={cn(text.base, colors.text.secondary)}>Loading...</p>
				) : error ? (
					<p className={cn(text.base, "text-red-600")}>Failed to load posts</p>
				) : post ? (
					<article className="space-y-2">
						<h3 className={cn(text.h3)}>{post.title}</h3>
						<p className={cn(text.small, colors.text.muted)}>
							{new Date(post.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</article>
				) : (
					<p className={cn(text.base, colors.text.secondary)}>
						No posts yet. Be the first to create one!
					</p>
				)}
			</div>
		</div>
	);
}
