import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hc } from 'hono/client'
import type { AppType } from '../index'
import { clientEnv } from './env'

// 定义 API 响应类型，匹配服务器返回的数据格式
export interface ApiQuote {
  id: number
  name: string
  email: string
  message: string
  createdAt: string | null
}

// 获取 API 基础 URL
function getApiBaseUrl(): string {
  // 在客户端，优先使用配置的 VITE_API_URL
  if (typeof window !== 'undefined') {
    return clientEnv.VITE_API_URL || window.location.origin
  }
  
  // 在服务器端（SSR），使用默认的本地开发地址
  return 'http://localhost:5174'
}

// 创建类型安全的 Hono RPC 客户端
function createRpcClient() {
  const baseUrl = getApiBaseUrl()
  console.log('🔗 API Base URL:', baseUrl) // 调试信息
  return hc<AppType>(baseUrl)
}

const rpcClient = createRpcClient()

// Query Keys
export const quotesKeys = {
  all: ['quotes'] as const,
  lists: () => [...quotesKeys.all, 'list'] as const,
  list: (filters: string) => [...quotesKeys.lists(), { filters }] as const,
  details: () => [...quotesKeys.all, 'detail'] as const,
  detail: (id: number) => [...quotesKeys.details(), id] as const,
}

// API 函数
const quotesApi = {
  getAll: async (): Promise<ApiQuote[]> => {
    const res = await rpcClient.api.quotes.$get()
    if (!res.ok) {
      throw new Error(`Failed to fetch quotes: ${res.status}`)
    }
    const result = await res.json()
    return result.data || []
  },

  getById: async (id: number): Promise<ApiQuote> => {
    const res = await rpcClient.api.quotes[':id'].$get({
      param: { id: id.toString() }
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch quote: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  create: async (data: { name: string; email: string; message: string }): Promise<ApiQuote> => {
    const res = await rpcClient.api.quotes.$post({
      json: data
    })
    if (!res.ok) {
      throw new Error(`Failed to create quote: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  update: async ({ id, data }: { id: number; data: Partial<{ name: string; email: string; message: string }> }): Promise<ApiQuote> => {
    const res = await rpcClient.api.quotes[':id'].$put({
      param: { id: id.toString() },
      json: data
    })
    if (!res.ok) {
      throw new Error(`Failed to update quote: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  delete: async (id: number): Promise<void> => {
    const res = await rpcClient.api.quotes[':id'].$delete({
      param: { id: id.toString() }
    })
    if (!res.ok) {
      throw new Error(`Failed to delete quote: ${res.status}`)
    }
  }
}

// React Query Hooks

// 获取所有留言
export function useQuotes() {
  return useQuery({
    queryKey: quotesKeys.lists(),
    queryFn: quotesApi.getAll,
  })
}

// 获取单个留言
export function useQuote(id: number) {
  return useQuery({
    queryKey: quotesKeys.detail(id),
    queryFn: () => quotesApi.getById(id),
    enabled: !!id,
  })
}

// 创建留言
export function useCreateQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: quotesApi.create,
    onSuccess: () => {
      // 使新的留言列表失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
    },
  })
}

// 更新留言
export function useUpdateQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: quotesApi.update,
    onSuccess: (data) => {
      // 更新缓存中的留言列表
      queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
      // 更新单个留言的缓存
      queryClient.setQueryData(quotesKeys.detail(data.id), data)
    },
  })
}

// 删除留言
export function useDeleteQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: quotesApi.delete,
    onSuccess: () => {
      // 使留言列表失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
    },
  })
} 