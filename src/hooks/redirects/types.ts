import type { client } from "@/server/api";
import type { InferRequestType, InferResponseType } from "hono/client";
import { z } from "zod";

// 短链接表单的 Zod schema
export const RedirectFormSchema = z.object({
	originalUrl: z.string().url("请输入有效的URL地址").min(1, "URL不能为空"),

	customCode: z.union([
		z
			.string()
			.min(3, "自定义代码长度应在3-20字符之间")
			.max(20, "自定义代码长度应在3-20字符之间")
			.regex(/^[A-Z0-9_-]+$/, "自定义代码只能包含字母、数字、下划线和横线"),
		z.literal(""),
	]),
});

// 导出类型
export type RedirectFormData = z.infer<typeof RedirectFormSchema>;

// 默认值
export const defaultRedirectFormValues: RedirectFormData = {
	originalUrl: "",
	customCode: "",
};

// 从 Hono RPC 推断类型，更加类型安全
export type GetRedirectsResponse = InferResponseType<typeof client.links.$get>;
export type GetRedirectResponse = InferResponseType<
	(typeof client.links)[":id"]["$get"]
>;
export type GetStatsResponse = InferResponseType<
	typeof client.links.stats.$get
>;
export type CreateRedirectRequest = InferRequestType<
	typeof client.links.$post
>["json"];
export type CreateRedirectResponse = InferResponseType<
	typeof client.links.$post
>;
export type UpdateRedirectRequest = InferRequestType<
	(typeof client.links)[":id"]["$put"]
>["json"];
export type UpdateRedirectResponse = InferResponseType<
	(typeof client.links)[":id"]["$put"]
>;
export type DeleteRedirectResponse = InferResponseType<
	(typeof client.links)[":id"]["$delete"]
>;
