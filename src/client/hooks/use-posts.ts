import { useQueryClient } from "@tanstack/react-query";
import {
	getGetApiPostsLatestQueryKey,
	useGetApiPostsLatest,
	usePostApiPosts,
} from "@/generated/endpoints/posts/posts";

// Hook for getting the latest post
export function useLatestPost() {
	const { data, isLoading, error } = useGetApiPostsLatest();

	return {
		post: data?.post ?? null,
		isLoading,
		error,
	};
}

// Hook for creating a post with all the logic
export function useCreatePost() {
	const queryClient = useQueryClient();

	const mutation = usePostApiPosts({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getGetApiPostsLatestQueryKey(),
				});
			},
		},
	});

	const createPost = (title: string) => {
		if (!title.trim()) return;
		mutation.mutate({ data: { title } });
	};

	return {
		createPost,
		isCreating: mutation.isPending,
		isSuccess: mutation.isSuccess,
		isError: mutation.isError,
	};
}
