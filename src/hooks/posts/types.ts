import type { client } from "@/api/client";
import type { authenticatedClient } from "@/lib/auth";
import type { InferResponseType } from "hono/client";
import { z } from "zod";

// 文章表单的 Zod schema
export const postFormSchema = z.object({
	title: z
		.string()
		.min(1, "标题不能为空")
		.min(3, "标题至少需要3个字符")
		.max(100, "标题不能超过100个字符"),

	content: z
		.string()
		.min(1, "内容不能为空")
		.min(10, "内容至少需要10个字符")
		.max(5000, "内容不能超过5000个字符"),
});

// 导出类型
export type PostFormData = z.infer<typeof postFormSchema>;

// 默认值
export const defaultPostFormValues: PostFormData = {
	title: "",
	content: "",
};

export type GetPostsResponse = InferResponseType<typeof client.posts.$get>;
export type GetPostResponse = InferResponseType<
	(typeof client.posts)[":id"]["$get"]
>;
export type GetLatestPostResponse = InferResponseType<
	typeof client.posts.latest.$get
>;
export type CreatePostResponse = InferResponseType<
	typeof authenticatedClient.posts.$post
>;
export type UpdatePostResponse = InferResponseType<
	(typeof authenticatedClient.posts)[":id"]["$put"]
>;
export type DeletePostResponse = InferResponseType<
	(typeof authenticatedClient.posts)[":id"]["$delete"]
>;
