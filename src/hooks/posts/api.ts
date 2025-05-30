import { client } from "@/api/client";
import { authenticatedClient } from "@/lib/auth";
import { createQueryKeys } from "@/lib/query-factory";
import { catchError } from "@/utils/catchError";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
	CreatePostResponse,
	DeletePostResponse,
	GetLatestPostResponse,
	GetPostResponse,
	GetPostsResponse,
	UpdatePostResponse,
} from "./types";

// 创建 Query Keys
const postsKeys = createQueryKeys("posts");

// 获取文章列表
export const usePosts = (
	params: {
		page?: number;
		limit?: number;
		sort?: "newest" | "oldest";
	} = {},
) => {
	const { page = 1, limit = 10, sort = "newest" } = params;

	return useQuery({
		queryKey: postsKeys.list({ page, limit, sort }),
		queryFn: async (): Promise<GetPostsResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.posts.$get({
					query: {
						page: page.toString(),
						limit: limit.toString(),
						sort: sort as "newest" | "oldest",
					},
				});
			});
			if (error || !result) {
				throw new Error("获取文章列表失败");
			}
			return result.json();
		},
	});
};

// 获取单个文章
export const usePost = (id: string) => {
	return useQuery({
		queryKey: postsKeys.detail(id),
		queryFn: async (): Promise<GetPostResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.posts[":id"].$get({
					param: { id },
				});
			});
			if (error || !result) {
				throw new Error("获取文章失败");
			}
			return result.json();
		},
		enabled: !!id,
	});
};

// 获取最新文章
export const useLatestPost = () => {
	return useQuery({
		queryKey: postsKeys.latest(),
		queryFn: async (): Promise<GetLatestPostResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.posts.latest.$get();
			});
			if (error || !result) {
				throw new Error("获取文章失败");
			}
			return result.json();
		},
	});
};

// 创建文章
export const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (newPost: { title: string; content: string }) => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.posts.$post({ json: newPost });
			});
			if (error || !result) {
				throw new Error("创建文章失败");
			}
			return result.json();
		},
		onSuccess: (data: CreatePostResponse) => {
			queryClient.invalidateQueries({ queryKey: postsKeys.all });
			toast.success("文章创建成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 更新文章
export const useUpdatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: { title?: string; content?: string };
		}): Promise<UpdatePostResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.posts[":id"].$put({
					param: { id },
					json: data,
				});
			});
			if (error || !result) {
				throw new Error("更新文章失败");
			}
			return result.json();
		},
		onSuccess: (data: UpdatePostResponse, variables) => {
			queryClient.invalidateQueries({ queryKey: postsKeys.all });
			queryClient.invalidateQueries({
				queryKey: postsKeys.detail(variables.id),
			});
			toast.success("文章更新成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 删除文章
export const useDeletePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<DeletePostResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await authenticatedClient.posts[":id"].$delete({
					param: { id },
				});
			});
			if (error || !result) {
				throw new Error("删除文章失败");
			}
			return result.json();
		},
		onSuccess: (data: DeletePostResponse) => {
			queryClient.invalidateQueries({ queryKey: postsKeys.all });
			toast.success("文章删除成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
