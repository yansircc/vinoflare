import type { client } from "@/server/api";
import type { InferRequestType, InferResponseType } from "hono/client";

// 定义 API 类型
export type GetIngredientsResponse = InferResponseType<
	typeof client.kitchen.ingredients.$get
>;
export type GetRandomIngredientsResponse = InferResponseType<
	typeof client.kitchen.randomIngredients.$get
>;
export type GetTasksResponse = InferResponseType<
	typeof client.kitchen.tasks.$get
>;
export type GetTaskResponse = InferResponseType<
	(typeof client.kitchen.tasks)[":taskId"]["$get"]
>;
export type ProcessIngredientsRequest = InferRequestType<
	typeof client.kitchen.process.$post
>["json"];
export type ProcessIngredientsResponse = InferResponseType<
	typeof client.kitchen.process.$post
>;
export type ClearTasksResponse = InferResponseType<
	typeof client.kitchen.tasks.$delete
>;
