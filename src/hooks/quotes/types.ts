import type { client } from "@/api/client";
import type { InferRequestType, InferResponseType } from "hono/client";
import { z } from "zod";

// 留言表单的 Zod schema
export const quoteFormSchema = z.object({
	name: z
		.string()
		.min(1, "姓名不能为空")
		.min(2, "姓名至少需要2个字符")
		.max(50, "姓名不能超过50个字符")
		.regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, "姓名只能包含中文、英文和空格"),

	email: z
		.string()
		.min(1, "邮箱不能为空")
		.email("请输入有效的邮箱地址")
		.max(100, "邮箱地址不能超过100个字符"),

	message: z
		.string()
		.min(1, "留言内容不能为空")
		.min(10, "留言内容至少需要10个字符")
		.max(500, "留言内容不能超过500个字符")
		.refine(
			(value) => !value.includes("spam") && !value.includes("广告"),
			"留言内容不能包含垃圾信息",
		),
});

// 导出类型
export type QuoteFormData = z.infer<typeof quoteFormSchema>;

// 默认值
export const defaultQuoteFormValues: QuoteFormData = {
	name: "",
	email: "",
	message: "",
};

// 从 Hono RPC 推断类型，更加类型安全
export type GetQuotesResponse = InferResponseType<typeof client.quotes.$get>;
export type GetQuoteResponse = InferResponseType<
	(typeof client.quotes)[":id"]["$get"]
>;
export type CreateQuoteRequest = InferRequestType<
	typeof client.quotes.$post
>["json"];
export type CreateQuoteResponse = InferResponseType<typeof client.quotes.$post>;
export type UpdateQuoteRequest = InferRequestType<
	(typeof client.quotes)[":id"]["$put"]
>["json"];
export type UpdateQuoteResponse = InferResponseType<
	(typeof client.quotes)[":id"]["$put"]
>;
export type DeleteQuoteResponse = InferResponseType<
	(typeof client.quotes)[":id"]["$delete"]
>;
