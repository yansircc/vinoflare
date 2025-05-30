import type { client } from "@/api/client";
import type { authenticatedClient } from "@/lib/auth";
import type { InferRequestType, InferResponseType } from "hono/client";

// 定义 API 类型
export type GetIngredientsResponse = InferResponseType<
	typeof client.kitchen.ingredients.$get
>;
export type GetRandomIngredientsResponse = InferResponseType<
	typeof client.kitchen.randomIngredients.$get
>;
export type GetTasksResponse = InferResponseType<
	typeof authenticatedClient.kitchen.tasks.$get
>;
export type GetTaskResponse = InferResponseType<
	(typeof authenticatedClient.kitchen.tasks)[":taskId"]["$get"]
>;
export type ProcessIngredientsRequest = InferRequestType<
	typeof authenticatedClient.kitchen.process.$post
>["json"];
export type ProcessIngredientsResponse = InferResponseType<
	typeof authenticatedClient.kitchen.process.$post
>;
export type ClearTasksResponse = InferResponseType<
	typeof authenticatedClient.kitchen.tasks.$delete
>;
