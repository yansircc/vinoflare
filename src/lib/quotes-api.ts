import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { toast } from 'sonner'
import { catchError } from '../utils/catchError'
import { apiHelpers, hono } from './api-client'
import { createQueryKeys } from './api-factory'

// 从 Hono RPC 推断类型，更加类型安全
type GetQuotesResponse = InferResponseType<typeof hono.api.quotes.$get>['data']
type GetQuoteResponse = InferResponseType<(typeof hono.api.quotes)[':id']['$get']>['data']  
type CreateQuoteRequest = InferRequestType<typeof hono.api.quotes.$post>['json']
type CreateQuoteResponse = InferResponseType<typeof hono.api.quotes.$post>
type UpdateQuoteRequest = InferRequestType<(typeof hono.api.quotes)[':id']['$put']>['json']
type UpdateQuoteResponse = InferResponseType<(typeof hono.api.quotes)[':id']['$put']>
type DeleteQuoteResponse = InferResponseType<(typeof hono.api.quotes)[':id']['$delete']>

// 创建 Query Keys
const quotesKeys = createQueryKeys('quotes')

// Hooks

// 获取所有留言
export const useQuotes = () => {
  return useQuery({
    queryKey: quotesKeys.all,
    queryFn: async (): Promise<GetQuotesResponse> => {
      const { data: result } = await catchError(async () => {
        return (await hono.api.quotes.$get()).json()
      }, {
        onError: (err) => {
          console.error('获取留言失败', err)
        }
      })

      if (!result) {
        throw new Error('获取留言失败')
      }
      return result.data
    },
  })
}

// 获取单个留言
export const useQuote = (id: string | number) => {
  return useQuery({
    queryKey: quotesKeys.detail(id),
      queryFn: async (): Promise<GetQuoteResponse> => {
      const { data: result, error } = await catchError(async () => {
        return (await hono.api.quotes[':id'].$get({
          param: { id: id.toString() }
        })).json()
      })
      if (error || !result) {
        throw new Error('获取留言失败')
      }
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
      const { data: result, error } = await catchError(async () => {
        return (await hono.api.quotes.$post({ json: newQuote })).json()
      })
      if (error || !result) {
        throw new Error('创建留言失败')
      }
      return result
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
      const { data: result, error } = await catchError(async () => {
        return (await hono.api.quotes[':id'].$put({
          param: { id: id.toString() },
          json: data
        })).json()
      })
      if (error || !result) {
        throw new Error('更新留言失败')
      }
      return result
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
      const { data: result, error } = await catchError(async () => {
        return (await hono.api.quotes[':id'].$delete({
          param: { id: id.toString() }
        })).json()
      })
      if (error || !result) {
        throw new Error('删除留言失败')
      }
      return result
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
