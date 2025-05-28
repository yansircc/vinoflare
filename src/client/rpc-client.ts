import { hc } from 'hono/client'
import type { AppType } from '../index'

// 创建类型安全的客户端
export const client = hc<AppType>('/')

// 使用示例函数
export namespace QuoteService {
  // 获取所有留言
  export async function getAllQuotes() {
    const res = await client.api.quotes.$get()
    if (res.ok) {
      return await res.json()
    }
    throw new Error('Failed to fetch quotes')
  }

  // 创建新留言
  export async function createQuote(data: {
    name: string
    email: string
    message: string
  }) {
    const res = await client.api.quotes.$post({
      json: data
    })
    
    if (res.ok) {
      return await res.json()
    }
    
    const error = await res.json()
    throw new Error('Failed to create quote')
  }

  // 获取单个留言
  export async function getQuote(id: number) {
    const res = await client.api.quotes[':id'].$get({
      param: { id: id.toString() }
    })
    
    if (res.ok) {
      return await res.json()
    }
    
    if (res.status === 404) {
      throw new Error('Quote not found')
    }
    
    throw new Error('Failed to fetch quote')
  }

  // 更新留言
  export async function updateQuote(id: number, data: {
    name?: string
    email?: string
    message?: string
  }) {
    const res = await client.api.quotes[':id'].$put({
      param: { id: id.toString() },
      json: data
    })
    
    if (res.ok) {
      return await res.json()
    }
    
    if (res.status === 404) {
      throw new Error('Quote not found')
    }
    
    throw new Error('Failed to update quote')
  }

  // 删除留言
  export async function deleteQuote(id: number) {
    const res = await client.api.quotes[':id'].$delete({
      param: { id: id.toString() }
    })
    
    if (res.ok) {
      return await res.json()
    }
    
    if (res.status === 404) {
      throw new Error('Quote not found')
    }
    
    throw new Error('Failed to delete quote')
  }
}

// 使用示例
export async function exampleUsage() {
  try {
    // 创建留言
    const newQuote = await QuoteService.createQuote({
      name: '张三',
      email: 'zhangsan@example.com',
      message: '这是一条测试留言'
    })
    console.log('创建成功:', newQuote)

    // 获取所有留言
    const allQuotes = await QuoteService.getAllQuotes()
    console.log('所有留言:', allQuotes)

    // 获取单个留言
    if (newQuote.data?.id) {
      const quote = await QuoteService.getQuote(newQuote.data.id)
      console.log('单个留言:', quote)

      // 更新留言
      const updatedQuote = await QuoteService.updateQuote(newQuote.data.id, {
        message: '更新后的留言内容'
      })
      console.log('更新成功:', updatedQuote)

      // 删除留言
      const deleteResult = await QuoteService.deleteQuote(newQuote.data.id)
      console.log('删除成功:', deleteResult)
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
} 