# TanStack Query 迁移与极简设计重构

## 概述

本项目已成功从 Hono RPC 直接调用迁移到 TanStack Query，并采用了极简设计风格。这次重构带来了更好的数据管理、用户体验和代码可维护性。

## 迁移内容

### 1. TanStack Query 集成

#### 安装依赖
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

#### QueryClient 配置
```typescript
// src/lib/query-client.ts
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,    // 5分钟数据新鲜度
        gcTime: 1000 * 60 * 30,      // 30分钟缓存时间
        retry: 1,                     // 重试1次
        refetchOnWindowFocus: false,  // 窗口聚焦时不重新获取
        refetchOnReconnect: true,     // 重连时重新获取
      },
      mutations: {
        retry: 1,                     // 突变重试1次
      },
    },
  })
}
```

#### 客户端提供者设置
```typescript
// src/client.tsx
function App() {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 2. API Hooks 重构

#### Query Keys 设计
```typescript
// src/lib/quotes-api.ts
export const quotesKeys = {
  all: ['quotes'] as const,
  lists: () => [...quotesKeys.all, 'list'] as const,
  list: (filters: string) => [...quotesKeys.lists(), { filters }] as const,
  details: () => [...quotesKeys.all, 'detail'] as const,
  detail: (id: number) => [...quotesKeys.details(), id] as const,
}
```

#### 数据获取 Hooks
```typescript
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
```

#### 数据变更 Hooks
```typescript
// 创建留言
export function useCreateQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: quotesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
    },
  })
}

// 删除留言
export function useDeleteQuote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: quotesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
    },
  })
}
```

### 3. 组件重构

#### 移除 TanStack Router Loader
```typescript
// 旧方式：使用 loader
export const Route = createFileRoute('/quotes/')({
  component: QuotesList,
  loader: async (): Promise<ApiQuote[]> => {
    // 在路由层获取数据
  },
})

// 新方式：使用 TanStack Query
export const Route = createFileRoute('/quotes/')({
  component: QuotesList,
  // 移除 loader，数据获取由组件内的 hooks 处理
})
```

#### 组件内数据管理
```typescript
function QuotesList() {
  // 使用 TanStack Query hooks
  const { data: quotes = [], isLoading, isError, error } = useQuotes()
  const createQuoteMutation = useCreateQuote()
  const deleteQuoteMutation = useDeleteQuote()

  // 处理加载状态
  if (isLoading) {
    return <div>加载中...</div>
  }

  // 处理错误状态
  if (isError) {
    return <div>加载失败: {error?.message}</div>
  }

  // 渲染数据
  return <div>{/* 组件内容 */}</div>
}
```

## 极简设计重构

### 1. 设计原则

#### 色彩方案
- **主色调**：`gray-900` (深灰色) - 主要按钮和文字
- **次要色调**：`gray-500` / `gray-600` - 次要文字和元素
- **背景色调**：`white` (主背景)、`gray-50` (卡片背景)
- **边框色调**：`gray-200` (边框)、`gray-100` (分割线)

#### 间距系统
- **容器宽度**：`max-w-2xl` (留言页面)、`max-w-4xl` (主页)
- **内边距**：`px-4` (移动端)、`py-8` / `py-16` (垂直间距)
- **组件间距**：`space-y-6` (列表)、`gap-3` (小元素)

#### 字体系统
- **主标题**：`text-4xl md:text-5xl font-light` (超大轻字体)
- **页面标题**：`text-2xl font-light` (大轻字体)
- **卡片标题**：`text-xl font-medium` (中等字体)
- **正文**：默认大小，`leading-relaxed` (宽松行高)
- **小字**：`text-sm` / `text-xs` (小字体)

### 2. 组件设计

#### 按钮设计
```css
/* 主要按钮 */
.btn-primary {
  @apply rounded-full bg-gray-900 px-6 py-2 text-sm text-white 
         transition-all hover:bg-gray-700 hover:scale-105;
}

/* 次要按钮 */
.btn-secondary {
  @apply rounded px-2 py-1 text-xs text-gray-400 
         transition-all hover:bg-gray-100 hover:text-red-600;
}
```

#### 表单设计
```css
/* 极简输入框 */
.input-minimal {
  @apply w-full border-0 border-b border-gray-200 bg-transparent 
         px-0 py-2 text-gray-900 placeholder-gray-400 
         focus:border-gray-900 focus:outline-none focus:ring-0;
}
```

#### 卡片设计
```css
/* 极简卡片 */
.card-minimal {
  @apply group border-b border-gray-100 pb-6 last:border-b-0;
}

/* 带边框卡片 */
.card-bordered {
  @apply rounded-lg border border-gray-200 p-6;
}
```

### 3. 交互设计

#### 悬停效果
- **按钮**：`hover:scale-105` (轻微放大)
- **删除按钮**：`opacity-0 group-hover:opacity-100` (悬停显示)
- **链接**：`hover:text-gray-900` (颜色变深)

#### 状态反馈
- **加载状态**：居中显示加载文字
- **错误状态**：红色文字显示错误信息
- **空状态**：居中显示提示信息和操作按钮

#### 响应式设计
- **网格布局**：`md:grid-cols-2` / `md:grid-cols-3`
- **文字大小**：`text-4xl md:text-5xl`
- **间距调整**：移动端优先，桌面端增强

## TanStack Query 优势

### 1. 数据管理
- ✅ **智能缓存**：自动缓存管理，减少网络请求
- ✅ **后台更新**：数据在后台自动更新，保持界面响应
- ✅ **乐观更新**：即时 UI 反馈，提升用户体验
- ✅ **错误处理**：统一的错误处理和重试机制

### 2. 开发体验
- ✅ **类型安全**：完整的 TypeScript 支持
- ✅ **开发工具**：React Query Devtools 调试支持
- ✅ **状态管理**：自动管理加载、错误、成功状态
- ✅ **代码复用**：可复用的 hooks 和查询逻辑

### 3. 性能优化
- ✅ **请求去重**：相同查询自动去重
- ✅ **并行查询**：支持并行数据获取
- ✅ **预取数据**：支持数据预取和预加载
- ✅ **内存管理**：自动垃圾回收和内存优化

## 与之前方案的对比

### RPC 直接调用 vs TanStack Query

| 特性 | RPC 直接调用 | TanStack Query |
|------|-------------|----------------|
| 缓存管理 | 手动管理 | 自动缓存 |
| 加载状态 | 手动处理 | 自动管理 |
| 错误处理 | 手动处理 | 统一处理 |
| 重试机制 | 需要实现 | 内置支持 |
| 乐观更新 | 复杂实现 | 简单配置 |
| 开发工具 | 无 | 专业调试工具 |
| 代码复杂度 | 较高 | 较低 |

### 传统设计 vs 极简设计

| 方面 | 传统设计 | 极简设计 |
|------|----------|----------|
| 色彩使用 | 多彩丰富 | 灰度为主 |
| 组件样式 | 装饰性强 | 功能性强 |
| 间距布局 | 紧凑 | 宽松透气 |
| 交互反馈 | 复杂动效 | 简单过渡 |
| 视觉层次 | 强对比 | 微妙层次 |
| 认知负担 | 较高 | 较低 |

## 最佳实践

### 1. Query Keys 管理
```typescript
// 使用工厂函数组织 Query Keys
export const quotesKeys = {
  all: ['quotes'] as const,
  lists: () => [...quotesKeys.all, 'list'] as const,
  details: () => [...quotesKeys.all, 'detail'] as const,
  detail: (id: number) => [...quotesKeys.details(), id] as const,
}
```

### 2. 错误边界处理
```typescript
// 在组件级别处理错误
if (isError) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-red-500">
        加载失败: {error?.message || '未知错误'}
      </div>
    </div>
  )
}
```

### 3. 乐观更新
```typescript
// 在 mutation 成功后更新缓存
const createQuoteMutation = useMutation({
  mutationFn: quotesApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
  },
})
```

### 4. 极简设计原则
- **少即是多**：移除不必要的装饰元素
- **功能优先**：每个元素都有明确的功能目的
- **一致性**：保持设计语言的一致性
- **可访问性**：确保良好的对比度和可读性

## 技术栈总结

### 最终架构
```
前端：
├── TanStack Query - 数据获取和状态管理
├── TanStack Router - 类型安全路由
├── React - 用户界面库
└── Tailwind CSS - 原子化样式

后端：
├── Hono - Web 框架
├── Drizzle ORM - 数据库操作
├── Cloudflare D1 - 边缘数据库
└── Vite - 构建工具
```

### 开发工具
- **TypeScript** - 类型安全
- **React Query Devtools** - 查询调试
- **Tailwind CSS IntelliSense** - 样式提示
- **ESLint** - 代码质量检查

这次重构成功地将项目升级为现代化的 React 应用，展示了 TanStack Query 的强大功能和极简设计的优雅之美。 