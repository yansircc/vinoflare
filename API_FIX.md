# API 路由问题修复

## 问题描述
当访问留言列表页面时，出现错误：
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## 问题原因
1. **路由顺序问题**: 在 `src/index.tsx` 中，通配符路由 `app.get('*')` 被放在了 API 路由之前，导致所有请求（包括 API 请求）都被重定向到 HTML 页面
2. **服务器端渲染 URL 问题**: 在 TanStack Router 的 loader 函数中，服务器端渲染时无法使用相对路径访问 API

## 修复方案

### 1. 修复路由顺序
将 API 路由移到通配符路由之前：

```typescript
// ❌ 错误的顺序
app.get('*', async (c) => { /* 返回 HTML */ })
app.route('/api/quotes', quotesRouter)

// ✅ 正确的顺序  
app.route('/api/quotes', quotesRouter)
app.get('*', async (c) => { /* 返回 HTML */ })
```

### 2. 创建 API 工具函数
创建 `src/lib/api.ts` 来处理不同环境下的 URL：

```typescript
export function getApiUrl(path: string): string {
  if (typeof window === 'undefined') {
    // 服务器端使用绝对 URL
    return `http://localhost:5174${path}`
  }
  // 客户端使用相对路径
  return path
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path)
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return await response.json()
}
```

### 3. 更新 Loader 函数
在路由文件中使用新的 API 工具：

```typescript
// src/routes/quotes.index.tsx
loader: async (): Promise<Quote[]> => {
  try {
    const data = await apiRequest<{ data: Quote[] }>('/api/quotes')
    return data.data || []
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return []
  }
}
```

## 修复结果
- ✅ API 端点正常返回 JSON 数据
- ✅ 留言列表页面可以正常加载数据
- ✅ 服务器端渲染和客户端渲染都正常工作
- ✅ 错误处理更加健壮

## 测试验证
```bash
# API 端点测试
curl http://localhost:5174/api/quotes
# 返回: {"success":true,"data":[...]}

# 页面访问测试
curl http://localhost:5174/quotes
# 返回: HTML 页面
``` 