# TanStack Router + Hono RPC 集成指南

## 概述

本项目展示了如何在 TanStack Router 应用中成功集成 Hono RPC，实现类型安全的全栈开发体验。

## 兼容性总结

✅ **完全兼容** - TanStack Router 和 Hono RPC 可以很好地协同工作

## 核心优势

### 1. 类型安全
- 服务端和客户端共享类型定义
- 编译时错误检查
- IDE 自动补全和智能提示

### 2. 开发体验
- 统一的 API 调用方式
- 自动的请求/响应序列化
- 内置错误处理

### 3. 性能优化
- 避免手动 URL 构建
- 减少运行时错误
- 更好的代码维护性

## 实现架构

```
src/
├── index.tsx                 # Hono 服务器 + AppType 导出
├── lib/
│   └── rpc-client.ts        # RPC 客户端封装
├── routes/
│   ├── index.tsx            # 主页
│   └── quotes.index.tsx     # 留言页面 (使用 RPC)
└── server/
    ├── db/                  # 数据库配置
    └── routers/             # API 路由
        └── quote-router.ts  # 留言 API
```

## 关键实现细节

### 1. 服务器端类型导出

```typescript
// src/index.tsx
const routes = app.route('/api/quotes', quotesRouter)

// 导出类型供客户端使用
export type AppType = typeof routes
```

### 2. RPC 客户端封装

```typescript
// src/lib/rpc-client.ts
import { hc } from 'hono/client'
import type { AppType } from '../index'

export function createRpcClient(baseUrl: string = '') {
  const url = typeof window === 'undefined' 
    ? `http://localhost:5174${baseUrl}` 
    : baseUrl

  return hc<AppType>(url)
}

export const quotesApi = {
  getAll: async () => {
    const res = await rpcClient.api.quotes.$get()
    return await res.json()
  },
  // ... 其他 API 方法
}
```

### 3. TanStack Router 集成

```typescript
// src/routes/quotes.index.tsx
export const Route = createFileRoute('/quotes/')({
  component: QuotesList,
  loader: async (): Promise<ApiQuote[]> => {
    try {
      const response = await quotesApi.getAll()
      return response.data || []
    } catch (error) {
      console.error('Error fetching quotes via RPC:', error)
      return []
    }
  },
})
```

## 最佳实践

### 1. 环境适配
- 服务器端渲染时使用绝对 URL
- 客户端使用相对路径
- 统一的错误处理机制

### 2. 类型管理
- 定义专门的 API 响应类型
- 处理日期字符串转换
- 保持类型一致性

### 3. 错误处理
- 在 loader 中捕获异常
- 提供降级数据
- 用户友好的错误提示

## 与传统 fetch 对比

| 特性 | 传统 fetch | Hono RPC |
|------|------------|----------|
| 类型安全 | ❌ 手动定义 | ✅ 自动推导 |
| URL 构建 | ❌ 手动拼接 | ✅ 自动生成 |
| 错误处理 | ❌ 手动检查 | ✅ 统一处理 |
| IDE 支持 | ❌ 有限 | ✅ 完整支持 |
| 维护成本 | ❌ 较高 | ✅ 较低 |

## 注意事项

### 1. 路由顺序
确保 API 路由在通配符路由之前：

```typescript
// ✅ 正确
app.route('/api/quotes', quotesRouter)
app.get('*', serveStaticFiles)

// ❌ 错误
app.get('*', serveStaticFiles)
app.route('/api/quotes', quotesRouter)
```

### 2. 服务器端渲染
在 SSR 环境中需要使用绝对 URL：

```typescript
const url = typeof window === 'undefined' 
  ? `http://localhost:5174${baseUrl}` 
  : baseUrl
```

### 3. 类型同步
保持服务端和客户端类型定义同步，避免运行时错误。

## 总结

TanStack Router 和 Hono RPC 的结合提供了：

- 🚀 **出色的开发体验** - 类型安全 + 自动补全
- 🛡️ **更少的错误** - 编译时检查 + 运行时验证  
- 🔧 **更好的维护性** - 统一的 API 调用方式
- ⚡ **更高的效率** - 减少样板代码

这种组合特别适合需要类型安全和快速开发的现代 Web 应用。 