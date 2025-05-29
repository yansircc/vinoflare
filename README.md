# Hono 全栈开发模板

一个现代化、类型安全的全栈应用开发模板，使用**标准 Hono 模式**和 RPC 实现无缝开发体验。

## 特性

- **类型安全的 RPC**: 使用 Hono 内置 RPC 功能实现从后端到前端的完整类型安全
- **标准 JSON**: 使用标准 JSON 进行可靠的数据传输
- **Zod 验证**: 使用 Zod schemas 进行运行时验证
- **React Query 集成**: 优化的数据获取，包含缓存和变更功能
- **Cloudflare Workers 就绪**: 可部署到边缘计算的 Cloudflare Workers
- **数据库集成**: 使用 Drizzle ORM 和 SQLite 进行本地开发

## 项目结构

```
src/
├── server/
│   ├── api/           # API 路由定义
│   ├── db/            # 数据库模式和类型
│   ├── middleware/    # 认证和日志中间件
│   └── routers/       # 使用 zValidator 的路由处理器
├── lib/
│   └── api-client.ts  # 类型安全的 API 客户端
├── components/        # React 组件
├── routes/           # TanStack Router 页面
└── index.tsx         # 服务器入口点
```

## 快速开始

### 前置条件

- [Bun](https://bun.sh) (推荐) 或 Node.js 18+
- Cloudflare 账户 (用于部署)

### 安装

```bash
# 安装依赖
bun install

# 设置数据库
bun run db:push

# 启动开发服务器
bun run dev
```

### 环境变量

创建 `.dev.vars` 文件用于本地开发：

```env
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
```

## 核心概念

### 1. 标准 Hono RPC

按照[官方 Hono 文档](https://hono.dev/docs/concepts/stacks)，此模板使用标准 Hono RPC 模式：

```typescript
// 服务器: 使用适当的链式调用定义路由
const app = new Hono()
  .get('/api/quotes', async (c) => {
    const quotes = await db.select().from(quotesTable)
    return c.json({
      success: true,
      data: quotes,
    })
  })
  .post('/api/quotes',
    zValidator('json', createQuoteSchema),
    async (c) => {
      const input = c.req.valid('json')
      // ... 创建引用逻辑
      return c.json({ success: true, data: newQuote }, 201)
    }
  )

export const quotesRouter = app
export type QuotesRouterType = typeof app
```

```typescript
// 客户端: 使用完整的类型安全
import { hc } from 'hono/client'
import type { InferResponseType } from 'hono/client'

const api = hc<AppType>('/')
const response = await api.api.quotes.$get()
const data = await response.json() // 完全类型化！
```

### 2. 中间件系统

用于横切关注点的标准 Hono 中间件：

```typescript
// 认证中间件
export const authMiddleware = createMiddleware<{
  Variables: { user: User }
}>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw new HTTPException(401, { message: '未授权' })
  }
  
  const user = await validateToken(token)
  c.set('user', user)
  await next()
})

// 在路由中使用
app.post('/api/quotes',
  authMiddleware,
  zValidator('json', schema),
  async (c) => {
    const user = c.get('user') // 完全类型化！
    // ... 处理器逻辑
  }
)
```

### 3. 创建新路由

1. **在 `src/server/routers/` 中定义路由器**：

```typescript
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware } from '../middleware/procedures'

// 输入验证
const createSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
})

export const postsRouter = new Hono()
  // 公开路由
  .get('/api/posts', async (c) => {
    const posts = await db.select().from(posts)
    return c.json({ success: true, data: posts })
  })
  
  // 受保护的路由，包含验证
  .post('/api/posts',
    authMiddleware,
    zValidator('json', createSchema),
    async (c) => {
      const user = c.get('user')
      const input = c.req.valid('json')
      
      const [newPost] = await db.insert(posts)
        .values({ ...input, userId: user.id })
        .returning()
      
      return c.json({ success: true, data: newPost }, 201)
    }
  )

export type PostsRouterType = typeof postsRouter
```

2. **在 `src/server/api/index.ts` 中挂载路由器**：

```typescript
import { postsRouter } from '../routers/posts'

const app = new Hono()
  .route('/', quotesRouter)
  .route('/', postsRouter) // 添加新路由器

export const api = app
export type ApiType = typeof app
```

3. **在 React 组件中使用**：

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { api, apiHelpers } from '../lib/api-client'
import type { InferResponseType } from 'hono/client'

// 类型安全的 API 调用
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: async () => {
    const response = await api.api.posts.$get()
    if (!response.ok) throw new Error('获取失败')
    return await response.json()
  },
})

// 带认证的类型安全变更
const createMutation = useMutation({
  mutationFn: async (newPost) => {
    const response = await api.api.posts.$post({
      json: newPost,
    }, {
      headers: apiHelpers.withAuth(),
    })
    if (!response.ok) throw new Error('创建失败')
    return await response.json()
  },
})
```

### 4. 身份验证

基于令牌的中间件身份验证：

```typescript
// 登录后设置令牌
apiHelpers.setAuthToken(token)

// 在 API 调用中使用
const response = await api.api.quotes.$post({
  json: data,
}, {
  headers: apiHelpers.withAuth(),
})

// 登出时清除
apiHelpers.clearAuthToken()
```

## 部署

### Cloudflare Workers

```bash
# 构建应用
bun run build

# 部署到 Cloudflare
bun run deploy
```

### 环境设置

1. 使用数据库绑定配置您的 `wrangler.toml`
2. 使用 Wrangler 设置密钥：

```bash
wrangler secret put JWT_SECRET
```

## 最佳实践

1. **遵循 Hono 模式**: 使用[官方文档](https://hono.dev/docs/concepts/stacks)中显示的标准 Hono 中间件和 RPC 模式
2. **类型安全**: 始终导出路由器类型并为客户端类型使用 `InferResponseType`
3. **验证**: 使用 `zValidator` 进行 Zod schemas 的运行时验证
4. **错误处理**: 使用 `HTTPException` 进行一致的错误响应
5. **中间件**: 为横切关注点创建可重用的中间件

## 从自定义系统迁移

此模板已重构为使用**标准 Hono 模式**而不是自定义程序系统：

- ✅ 使用 `zValidator` 进行验证
- ✅ 使用 `createMiddleware` 的标准 Hono 中间件
- ✅ 使用 `typeof app` 的适当 RPC 类型导出
- ✅ 使用标准 JSON 而不是自定义序列化
- ✅ 遵循官方 Hono 文档模式

## 改造顺序推荐
- server/db/schema.ts (如有必要，此处添加数据库表)
- `bun db:generate` && `wrangler d1 migrations apply DB --local`
- server/db/types.ts（添加完数据表后，此处添加对应的 types）
- server/routers/ (添加对应的 rpc 路由)
- lib/quote-schema.ts (如有必要，添加对应的验证类型)
- components/ (如有必要，添加)
- routes/ (添加对应路由，添加是会自动生成一个模板)

## 贡献

此模板遵循官方 Hono 模式和最佳实践。欢迎：

- 按照既定模式添加新功能
- 改进中间件
- 增强类型安全
- 更新依赖项

## 许可证

MIT
