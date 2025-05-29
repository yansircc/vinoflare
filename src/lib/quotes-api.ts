import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { toast } from "sonner";
import { catchError } from "../utils/catchError";
import { authenticatedClient, client } from "./api-client";
import { createQueryKeys } from "./api-factory";

// 从 Hono RPC 推断类型，更加类型安全
type GetQuotesResponse = InferResponseType<typeof client.quotes.$get>["data"];
type GetQuoteResponse = InferResponseType<
	(typeof client.quotes)[":id"]["$get"]
>["data"];
type CreateQuoteRequest = InferRequestType<typeof client.quotes.$post>["json"];
type CreateQuoteResponse = InferResponseType<typeof client.quotes.$post>;
type UpdateQuoteRequest = InferRequestType<
	(typeof client.quotes)[":id"]["$put"]
>["json"];
type UpdateQuoteResponse = InferResponseType<
	(typeof client.quotes)[":id"]["$put"]
>;
type DeleteQuoteResponse = InferResponseType<
	(typeof client.quotes)[":id"]["$delete"]
>;

// 创建 Query Keys
const quotesKeys = createQueryKeys("quotes");

// Hooks

// 获取所有留言
export const useQuotes = () => {
	return useQuery({
		queryKey: quotesKeys.all,
		queryFn: async (): Promise<GetQuotesResponse> => {
			const { data: result } = await catchError(
				async () => {
					const res = await client.quotes.$get({ query: {} });
					return res.json();
				},
				{
					onError: (err) => {
						console.error("获取留言失败", err);
					},
				},
			);

			if (!result) {
				throw new Error("获取留言失败");
			}
			return result.data;
		},
	});
};

// 获取单个留言
export const useQuote = (id: string | number) => {
	return useQuery({
		queryKey: quotesKeys.detail(id),
		queryFn: async (): Promise<GetQuoteResponse> => {
			const { data: result, error } = await catchError(async () => {
				const res = await authenticatedClient.quotes[":id"].$get({
					param: { id: id.toString() },
				});
				return res.json();
			});
			if (error || !result) {
				throw new Error("获取留言失败");
			}
			return result.data;
		},
		enabled: !!id,
	});
};

// 创建留言
export const useCreateQuote = () => {
	const queryClient = useQueryClient();

	return useMutation<CreateQuoteResponse, Error, CreateQuoteRequest>({
		mutationFn: async (newQuote) => {
			const { data: result, error } = await catchError(async () => {
				const res = await authenticatedClient.quotes.$post({ json: newQuote });
				return res.json();
			});
			if (error || !result) {
				throw new Error("创建留言失败");
			}
			return result;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: quotesKeys.all });
			toast.success("留言创建成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
// 更新留言
export const useUpdateQuote = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateQuoteResponse,
		Error,
		{ id: string | number; data: UpdateQuoteRequest }
	>({
		mutationFn: async ({ id, data }) => {
			const { data: result, error } = await catchError(async () => {
				const res = await authenticatedClient.quotes[":id"].$put({
					param: { id: id.toString() },
					json: data,
				});
				return res.json();
			});
			if (error || !result) {
				throw new Error("更新留言失败");
			}
			return result;
		},
		onSuccess: (data, variables) => {
			// 使列表失效
			queryClient.invalidateQueries({ queryKey: quotesKeys.all });
			// 更新单个项目的缓存
			if (data) {
				queryClient.setQueryData(quotesKeys.detail(variables.id), data);
			}
			toast.success("留言更新成功！");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 删除留言
export const useDeleteQuote = () => {
	const queryClient = useQueryClient();

	return useMutation<DeleteQuoteResponse, Error, string | number>({
		mutationFn: async (id) => {
			const { data: result, error } = await catchError(async () => {
				const res = await authenticatedClient.quotes[":id"].$delete({
					param: { id: id.toString() },
				});
				return res.json();
			});
			if (error || !result) {
				throw new Error("删除留言失败");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: quotesKeys.all });
			toast.success("留言删除成功！");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
