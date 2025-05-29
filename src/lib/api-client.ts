import { hc } from 'hono/client'
import type { AppType } from '../index'

// 创建 API 客户端
export function createApiClient(baseUrl?: string) {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')
  
  return hc<AppType>(url, {
    init: {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })
}

// 类型安全的 API 客户端实例
export const api = createApiClient()

// 常见 API 模式的辅助函数
export const apiHelpers = {
  // 设置认证令牌
  setAuthToken(token: string) {
    localStorage.setItem('auth-token', token)
  },
  
  // 清除认证令牌
  clearAuthToken() {
    localStorage.removeItem('auth-token')
  },
  
  // 检查是否已认证
  isAuthenticated() {
    return !!localStorage.getItem('auth-token')
  },
  
  // 向请求添加认证头
  withAuth(headers: Record<string, string> = {}) {
    const token = localStorage.getItem('auth-token')
    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return headers
  },
}

// 导出类型以在组件中使用
export type ApiClient = ReturnType<typeof createApiClient> 