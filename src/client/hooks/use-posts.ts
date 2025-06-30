import { useQueryClient } from "@tanstack/react-query";
import {
	getGetPostsLatestQueryKey,
	useGetPostsLatest,
	usePostPosts,
} from "@/generated/endpoints/post/post";

// Hook for getting the latest post
export function useLatestPost() {
	const { data, isLoading, error } = useGetPostsLatest();

	return {
		post: data?.post ?? null,
		isLoading,
		error,
	};
}

// Hook for creating a post with all the logic
export function useCreatePost() {
	const queryClient = useQueryClient();

	const mutation = usePostPosts({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getGetPostsLatestQueryKey(),
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
