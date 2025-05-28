import { hc } from 'hono/client'
import type { AppType } from '../index'

// 定义 API 响应类型，匹配服务器返回的数据格式
export interface ApiQuote {
  id: number
  name: string
  email: string
  message: string
  createdAt: string | null // API 返回的是字符串格式的日期
}

// 创建类型安全的 Hono RPC 客户端
export function createRpcClient(baseUrl = '') {
  // 在服务器端渲染时使用绝对 URL，客户端使用相对路径
  const url = typeof window === 'undefined' 
    ? `http://localhost:5174${baseUrl}` 
    : baseUrl

  return hc<AppType>(url)
}

// 创建默认的 RPC 客户端实例
export const rpcClient = createRpcClient()

// 导出类型安全的 API 方法
export const quotesApi = {
  // 获取所有留言
  getAll: async (): Promise<{ success: boolean; data: ApiQuote[] }> => {
    const res = await rpcClient.api.quotes.$get()
    if (!res.ok) {
      throw new Error(`Failed to fetch quotes: ${res.status}`)
    }
    return await res.json()
  },

  // 获取单个留言
  getById: async (id: string): Promise<{ success: boolean; data: ApiQuote }> => {
    const res = await rpcClient.api.quotes[':id'].$get({
      param: { id }
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch quote: ${res.status}`)
    }
    return await res.json()
  },

  // 创建新留言
  create: async (data: { name: string; email: string; message: string }): Promise<{ success: boolean; message: string; data: ApiQuote }> => {
    const res = await rpcClient.api.quotes.$post({
      json: data
    })
    if (!res.ok) {
      throw new Error(`Failed to create quote: ${res.status}`)
    }
    return await res.json()
  },

  // 更新留言
  update: async (id: string, data: Partial<{ name: string; email: string; message: string }>): Promise<{ success: boolean; message: string; data: ApiQuote }> => {
    const res = await rpcClient.api.quotes[':id'].$put({
      param: { id },
      json: data
    })
    if (!res.ok) {
      throw new Error(`Failed to update quote: ${res.status}`)
    }
    return await res.json()
  },

  // 删除留言
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await rpcClient.api.quotes[':id'].$delete({
      param: { id }
    })
    if (!res.ok) {
      throw new Error(`Failed to delete quote: ${res.status}`)
    }
    return await res.json()
  }
} 