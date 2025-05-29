# Vinoflare - 现代化 Hono 全栈开发模板

一个经过**生产级优化**的现代化、类型安全的全栈应用开发模板，使用 **Hono + Cloudflare Workers + Better Auth** 技术栈，实现无缝的端到端类型安全开发体验。

## 🚀 Vinoflare 是什么？

**Vinoflare** = **Vi**te + Ho**no** + Cloud**flare**，是一个完整的全栈开发解决方案：

- **🎯 生产就绪**: 内置安全、错误处理、日志记录、速率限制
- **⚡ 边缘优先**: 专为 Cloudflare Workers 优化，全球低延迟
- **🔒 安全第一**: Better Auth + Discord OAuth，企业级安全配置
- **🎨 类型安全**: 端到端 TypeScript，从数据库到 UI 的完整类型安全
- **📦 开箱即用**: 一键部署，零配置开始开发

## ✨ 核心特性

### 🏗️ 架构特性
- **统一上下文类型系统**: 消除重复类型定义，一次定义全局复用
- **标准 Hono RPC 模式**: 遵循官方最佳实践，类型安全的 API 调用
- **生产级中间件**: 认证、日志、错误处理、安全头、CORS 配置
- **智能分页系统**: 内置分页、排序、搜索功能

### 🔐 认证 & 安全
- **Better Auth 集成**: Discord OAuth，JWT，会话管理
- **自动安全配置**: 安全头、CORS、速率限制、IP 追踪
- **JWT 密钥管理**: 自动生成、加密存储、密钥轮换支持
- **可选认证中间件**: 灵活的公开/私有端点配置

### 🗄️ 数据层
- **Drizzle ORM**: 类型安全的数据库操作
- **Cloudflare D1**: 边缘数据库，全球同步
- **Zod 验证**: 运行时类型验证，防止数据污染
- **数据库迁移**: 自动迁移管理和版本控制

### 🎨 开发体验
- **TanStack Router**: 类型安全的路由系统
- **React Query**: 智能缓存和状态管理
- **实时错误追踪**: 请求ID追踪，详细错误日志
- **热重载开发**: 快速开发反馈循环

## 📁 项目结构

```
src/
├── server/
│   ├── api/
│   │   ├── index.ts          # 主 API 路由，全局中间件
│   │   └── auth.ts           # Better Auth 路由处理
│   ├── db/
│   │   ├── schema.ts         # 数据库表定义
│   │   ├── types.ts          # Zod schemas 和类型
│   │   └── index.ts          # 数据库工厂函数
│   ├── middleware/
│   │   └── procedures.ts     # 认证、日志、错误处理中间件
│   ├── routers/
│   │   ├── posts.ts          # 文章 CRUD 路由
│   │   └── quotes.ts         # 留言 CRUD 路由
│   ├── types/
│   │   └── context.ts        # 🆕 统一的 Hono 上下文类型
│   ├── auth.ts               # Better Auth 配置
│   └── index.tsx             # 服务器入口
├── lib/
│   ├── api-client.ts         # 类型安全的 API 客户端
│   └── env.ts                # 环境变量管理和验证
├── components/               # React 组件
├── routes/                   # TanStack Router 页面
└── scripts/                  # 🆕 维护脚本
    └── reset-auth.sh         # 认证数据重置脚本
```

## 🚀 快速开始

### 前置条件

- [Bun](https://bun.sh) (推荐) 或 Node.js 18+
- [Cloudflare 账户](https://cloudflare.com) (用于部署)
- [Discord Developer Application](https://discord.com/developers/applications) (用于 OAuth)

### 一键安装

```bash
# 1. 克隆项目
git clone https://github.com/yansircc/vinoflare.git vinoflare-app
cd vinoflare-app

# 2. 安装依赖
bun install

# 3. 配置环境变量
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 添加你的 Discord OAuth 信息

# 可选：如需使用`bun db:studio:remote`链接远程数据库，需要配置 env 的环境变量
cp .env.example .env

# 4. 创建数据库，随后需编辑 wrangler.toml 和 .env
wrangler d1 create vinoflare-db
# 复制 database_id 到 wrangler.toml

# 5. 生成类型和迁移
bun cf-typegen
bun db:generate
bun db:push:local

# 6. 启动开发服务器
bun dev
```

### 环境变量配置

创建 `.dev.vars` 文件：

```env
# 应用配置
APP_URL=http://localhost:5173
NODE_ENV=development

# Better Auth 密钥 (自动生成32字符)
BETTER_AUTH_SECRET=2b2c72294e1674d35a1b9af9d5c0b2a1a93f9c8dbc2da605075923e68f3ea020

# Discord OAuth (从 Discord Developer Portal 获取)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

## 🎯 核心概念

### 1. 统一上下文类型系统

**新特性**：我们创建了统一的 Hono 上下文类型系统：

```typescript
// src/server/types/context.ts
export interface BaseContext {
  Bindings: Env  // 基础环境变量
}

export interface AuthContext extends BaseContext {
  Variables: {
    user?: AuthUser      // 用户信息
    session?: AuthSession // 会话信息
  }
}

export interface BetterAuthContext {
  Bindings: {
    DB: D1Database
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string
    // ... Better Auth 专用环境变量
  }
}
```

**使用方式**：

```typescript
// 基础路由 (健康检查、API 信息)
const app = new Hono<BaseContext>()

// 业务路由 (需要认证功能)
const app = new Hono<AuthContext>()

// 认证路由 (Better Auth 端点)
const app = new Hono<BetterAuthContext>()
```

### 2. 智能分页和验证

所有 API 支持智能分页，查询参数自动可选：

```typescript
// 自动分页支持
const querySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1') || 1),
  limit: z.string().optional().transform(val => parseInt(val || '10') || 10),
  sort: z.enum(['newest', 'oldest']).default('newest'),
  search: z.string().optional(),
})

// API 调用示例
GET /api/quotes                    // 默认分页
GET /api/quotes?page=2&limit=5     // 自定义分页
GET /api/quotes?search=keyword     // 搜索功能
```

### 3. 生产级安全配置

内置全面的安全功能：

```typescript
// 安全头配置
app.use('*', secureHeaders({
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  xXssProtection: '1; mode=block',
  referrerPolicy: 'strict-origin-when-cross-origin',
}))

// Better Auth 安全配置
betterAuth({
  // 速率限制
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/*": { window: 300, max: 5 }
    }
  },
  
  // IP 追踪 (Cloudflare Workers)
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"]
    }
  }
})
```

### 4. 创建新的 CRUD 路由

快速创建标准 CRUD 功能：

```typescript
// 1. 在 src/server/routers/ 创建路由
import { AuthContext } from '../types/context'

const app = new Hono<AuthContext>()
  .get('/api/items', 
    optionalAuthMiddleware,
    zValidator('query', types.querySchema),
    async (c) => {
      // 自动分页逻辑
      const { page, limit, sort } = c.req.valid('query')
      // ... CRUD 实现
    })
  .post('/api/items',
    authMiddleware,  // 需要认证
    zValidator('json', types.itemCreateSchema),
    async (c) => {
      const user = c.get('user')  // 类型安全的用户信息
      // ... 创建逻辑
    })

export const itemsRouter = app
```

### 5. 类型安全的客户端调用

完整的端到端类型安全：

```typescript
// 完全类型化的 API 调用
const { data } = useQuery({
  queryKey: ['quotes', { page: 1 }],
  queryFn: async () => {
    const response = await client.api.quotes.$get({
      query: { page: '1', limit: '10' }
    })
    if (!response.ok) throw new Error('获取失败')
    return await response.json()  // 类型安全！
  }
})

// 类型安全的变更操作
const createMutation = useMutation({
  mutationFn: async (newQuote: QuoteCreate) => {
    const response = await client.api.quotes.$post({
      json: newQuote
    })
    return await response.json()
  }
})
```

## 🔧 维护和故障排除

### 认证问题修复

当遇到 JWT 密钥问题时，使用内置脚本：

```bash
# 重置认证数据 (清理旧的 JWT 密钥)
./scripts/reset-auth.sh

# 或手动清理
wrangler d1 execute vinoflare --local --command="DELETE FROM jwks;"
```

### 常用维护命令

```bash
# 数据库操作
bun db:generate        # 生成迁移文件
bun db:push:local      # 推送到本地数据库
bun db:push:remote     # 推送到云端数据库
bun db:studio:local    # 检查本地数据库
bun db:studio:remote   # 检查云端数据库

# 开发工具
bun cf-typegen         # 生成 Cloudflare 类型
bun dev                # 启动开发服务器
bun build              # 构建生产版本

# 部署相关
bun deploy             # 部署到 Cloudflare Workers
wrangler secret put SECRET_NAME  # 设置生产环境密钥
```

### API 健康检查

```bash
# 检查 API 状态
curl http://localhost:5173/health

# 查看 API 信息
curl http://localhost:5173/api

# 测试认证端点
curl http://localhost:5173/api/auth/get-session
```

## 🚀 部署到生产

### Cloudflare Workers 部署

```bash
# 创建 .env.production
cp .env .env.production

# 同步密钥到云端
bun env:sync:remote

# 4. 推送数据库架构
bun db:push:remote

# 5. 构建和部署
# bun run build(不需要构建，构建已包含在 deploy 命令中)
bun run deploy
```

> 如果部署到 cloudflare workers 之后链接了 github 仓库中的项目，后续不再需要手动构建部署，github 推送后，项目即可立即同步。

### 环境变量清单

**开发环境** (`.dev.vars`):
- `APP_URL`: 本地开发地址
- `BETTER_AUTH_SECRET`: 32字符随机密钥
- `DISCORD_CLIENT_ID/SECRET`: Discord OAuth 凭据

**生产环境** (Cloudflare Secrets):
- 相同的环境变量，但使用生产值
- 通过 `wrangler secret put` 设置敏感信息

## 📚 最佳实践

### 1. 遵循统一类型系统
```typescript
// ✅ 推荐: 使用统一上下文类型
import type { AuthContext } from '../types/context'
const app = new Hono<AuthContext>()

// ❌ 避免: 重复定义类型
const app = new Hono<{ Bindings: Env, Variables: {...} }>()
```

### 2. 智能中间件使用
```typescript
// ✅ 公开端点使用可选认证
app.get('/api/quotes', optionalAuthMiddleware, handler)

// ✅ 私有端点使用强制认证
app.post('/api/quotes', authMiddleware, handler)
```

### 3. 标准化错误处理
```typescript
// ✅ 使用 HTTPException 返回标准错误
throw new HTTPException(400, { 
  message: '输入验证失败',
  cause: 'VALIDATION_ERROR' 
})

// ✅ 在 try-catch 中包装数据库操作
try {
  const result = await db.insert(quotes).values(data)
  return c.json({ success: true, data: result })
} catch (error) {
  console.error('数据库操作失败:', error)
  return c.json({ 
    success: false, 
    error: '创建失败' 
  }, 500)
}
```

## 🔄 更新和迁移

### 版本升级指南

本模板现在使用：
- ✅ **标准 Hono RPC 模式** (官方推荐)
- ✅ **统一上下文类型系统** (减少重复代码)
- ✅ **Better Auth 集成** (企业级认证)
- ✅ **生产级安全配置** (安全头、CORS、速率限制)

### 开发工作流

推荐的开发顺序：
1. **设计数据模型** → `server/db/schema.ts`
2. **生成迁移** → `bun db:generate && bun db:push:local`
3. **定义类型** → `server/db/types.ts`
4. **创建路由** → `server/routers/`
5. **实现前端** → `components/` 和 `routes/`

## 🤝 贡献指南

欢迎贡献！请遵循现有的模式：

- 使用统一的上下文类型系统
- 遵循标准 Hono RPC 模式
- 添加适当的错误处理和日志
- 确保类型安全
- 包含测试和文档

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**Vinoflare** - 让全栈开发变成一种享受 🚀
