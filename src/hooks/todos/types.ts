import type { client } from "@/server/api";
import type { InferRequestType, InferResponseType } from "hono/client";
import { z } from "zod";

// 待办事项表单的 Zod schema
export const todoFormSchema = z.object({
	title: z
		.string()
		.min(1, "标题不能为空")
		.min(2, "标题至少需要2个字符")
		.max(100, "标题不能超过100个字符"),

	description: z
		.string()
		.optional()
		.refine((value) => !value || value.length <= 500, "描述不能超过500个字符"),

	completed: z.boolean().default(false),

	priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// 导出类型
export type TodoFormData = z.infer<typeof todoFormSchema>;

// 默认值
export const defaultTodoFormValues: TodoFormData = {
	title: "",
	description: "",
	completed: false,
	priority: "medium",
};

// 从 Hono RPC 推断类型，更加类型安全
export type GetTodosResponse = InferResponseType<typeof client.todos.$get>;
export type GetTodoResponse = InferResponseType<
	(typeof client.todos)[":id"]["$get"]
>;
export type CreateTodoRequest = InferRequestType<
	typeof client.todos.$post
>["json"];
export type CreateTodoResponse = InferResponseType<typeof client.todos.$post>;
export type UpdateTodoRequest = InferRequestType<
	(typeof client.todos)[":id"]["$put"]
>["json"];
export type UpdateTodoResponse = InferResponseType<
	(typeof client.todos)[":id"]["$put"]
>;
export type DeleteTodoResponse = InferResponseType<
	(typeof client.todos)[":id"]["$delete"]
>;
