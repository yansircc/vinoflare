import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { toast } from 'sonner'
import { apiHelpers, client } from './api-client'
import { createQueryKeys } from './api-factory'

// 从 Hono RPC 推断类型，更加类型安全
type GetQuotesResponse = InferResponseType<typeof client.api.quotes.$get>['data']
type GetQuoteResponse = InferResponseType<(typeof client.api.quotes)[':id']['$get']>['data']  
type CreateQuoteRequest = InferRequestType<typeof client.api.quotes.$post>['json']
type CreateQuoteResponse = InferResponseType<typeof client.api.quotes.$post>
type UpdateQuoteRequest = InferRequestType<(typeof client.api.quotes)[':id']['$put']>['json']
type UpdateQuoteResponse = InferResponseType<(typeof client.api.quotes)[':id']['$put']>
type DeleteQuoteResponse = InferResponseType<(typeof client.api.quotes)[':id']['$delete']>

// 创建 Query Keys
const quotesKeys = createQueryKeys('quotes')

// Hooks

// 获取所有留言
export const useQuotes = () => {
  return useQuery({
    queryKey: quotesKeys.all,
    queryFn: async (): Promise<GetQuotesResponse> => {
      const response = await client.api.quotes.$get()
      if (!response.ok) {
        throw new Error('获取留言失败')
      }
      const result = await response.json()
      return result.data || []
    },
  })
}

// 获取单个留言
export const useQuote = (id: string | number) => {
  return useQuery({
    queryKey: quotesKeys.detail(id),
      queryFn: async (): Promise<GetQuoteResponse> => {
      const response = await client.api.quotes[':id'].$get({
        param: { id: id.toString() }
      })
      if (!response.ok) {
        throw new Error('获取留言失败')
      }
      const result = await response.json()
      return result.data
    },
    enabled: !!id,
  })
}

// 创建留言
export const useCreateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateQuoteResponse, Error, CreateQuoteRequest>({
    mutationFn: async (newQuote) => {
      const response = await client.api.quotes.$post(
        { json: newQuote },
        { headers: apiHelpers.withAuth() }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).message || '创建留言失败')
      }
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all })
      toast.success('留言创建成功！')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// 更新留言
export const useUpdateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateQuoteResponse,
    Error,
    { id: string | number; data: UpdateQuoteRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await client.api.quotes[':id'].$put(
        {
          param: { id: id.toString() },
          json: data
        },
        { headers: apiHelpers.withAuth() }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).message || '更新留言失败')
      }
      return await response.json()
    },
    onSuccess: (data, variables) => {
      // 使列表失效
      queryClient.invalidateQueries({ queryKey: quotesKeys.all })
      // 更新单个项目的缓存
      if (data.data) {
        queryClient.setQueryData(quotesKeys.detail(variables.id), data.data)
      }
      toast.success('留言更新成功！')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// 删除留言
export const useDeleteQuote = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteQuoteResponse, Error, string | number>({
    mutationFn: async (id) => {
      const response = await client.api.quotes[':id'].$delete(
        { param: { id: id.toString() } },
        { headers: apiHelpers.withAuth() }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).message || '删除留言失败')
      }
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all })
      toast.success('留言删除成功！')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
