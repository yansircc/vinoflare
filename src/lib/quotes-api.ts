import { hc } from 'hono/client'
import type { AppType } from '../index'
import type { QuoteCreate, QuoteSlect } from '../server/db/types'
import { createCrudHooks, getApiBaseUrl } from './api-factory'

// 创建类型安全的 RPC 客户端
const rpcClient = hc<AppType>(getApiBaseUrl()) as any

// API 函数
const quotesApi = {
  getAll: async (): Promise<QuoteSlect[]> => {
    const res = await rpcClient.api.quotes.$get()
    if (!res.ok) {
      throw new Error(`获取留言失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data || []
  },

  getById: async (id: string | number): Promise<QuoteSlect> => {
    const res = await rpcClient.api.quotes[':id'].$get({
      param: { id: id.toString() }
    })
    if (!res.ok) {
      throw new Error(`获取留言失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  create: async (data: QuoteCreate): Promise<QuoteSlect> => {
    const res = await rpcClient.api.quotes.$post({
      json: data
    })
    if (!res.ok) {
      throw new Error(`创建留言失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  update: async ({ id, data }: { id: string | number; data: Partial<QuoteSlect> }): Promise<QuoteSlect> => {
    const res = await rpcClient.api.quotes[':id'].$put({
      param: { id: id.toString() },
      json: data
    })
    if (!res.ok) {
      throw new Error(`更新留言失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  delete: async (id: string | number): Promise<void> => {
    const res = await rpcClient.api.quotes[':id'].$delete({
      param: { id: id.toString() }
    })
    if (!res.ok) {
      throw new Error(`删除留言失败: ${res.status}`)
    }
  }
}

// 使用工厂创建 CRUD hooks
const quotesHooks = createCrudHooks<QuoteSlect, QuoteCreate>({
  resource: 'quotes',
  api: quotesApi,
  getId: (quote) => quote.id,
})

// 导出 hooks
export const {
  queryKeys: quotesKeys,
  useList: useQuotes,
  useItem: useQuote,
  useCreate: useCreateQuote,
  useUpdate: useUpdateQuote,
  useDelete: useDeleteQuote,
} = quotesHooks