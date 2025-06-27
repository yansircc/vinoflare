# Vinoflare - 现代化 Hono 全栈开发框架

**Vinoflare** = **Vi**te + Ho**no** + Cloud**flare**

一个经过**生产级优化**的现代化、类型安全的全栈应用开发框架，使用 **Hono + TanStack Router + Cloudflare Workers + Better Auth** 技术栈，实现无缝的端到端类型安全开发体验。

## 🎯 设计哲学

### 1. **类型优先，零妥协**
- 从数据库到前端的完整类型流
- 使用 Zod v4 进行运行时验证
- Drizzle-zod 自动生成数据库模式验证
- OpenAPI 规范驱动的客户端代码生成

### 2. **模块化架构**
- 清晰的关注点分离
- 可插拔的功能模块
- 智能的依赖管理
- 零配置的模块自动发现

### 3. **开发者体验至上**
- 单命令项目初始化
- 热重载开发环境
- 自动化代码生成
- 统一的错误处理

## 🚀 快速开始

### 使用 create-vinoflare（推荐）

```bash
# 使用 Bun（推荐）
bunx create-vinoflare@latest my-app

# 使用 npm
npx create-vinoflare@latest my-app

# 使用 pnpm
pnpm create vinoflare@latest my-app

# 使用 yarn
yarn create vinoflare my-app
```

### 非交互式创建

```bash
# Full-stack 应用（默认配置）
bunx create-vinoflare my-app -y

# API-only 无数据库
bunx create-vinoflare my-api --type=api-only --no-db -y

# Full-stack 有数据库但无认证
bunx create-vinoflare my-app --no-auth -y
```

## 📋 命令行选项

```
-y, --yes              跳过所有提示，使用默认配置
--type=<type>          项目类型：full-stack 或 api-only（默认：full-stack）
--no-db                不包含 D1 数据库
--no-auth              不包含 Better Auth（需要数据库）
--no-install           跳过依赖安装
--no-git               跳过 Git 初始化
--skip-init            跳过项目初始化（类型生成等）
--pm=<pm>              指定包管理器：npm、yarn、pnpm 或 bun
-h, --help             显示帮助信息
```

## 🏗️ 架构亮点

### 统一的上下文类型系统

```typescript
// src/server/lib/types.ts
export interface BaseContext {
  Bindings: CloudflareBindings;
  Variables: {
    db: D1Database;           // 数据库实例（可选）
    user?: AuthUser;          // 认证用户（可选）
    session?: AuthSession;    // 会话信息（可选）
  };
}
```

### 模块化 API 设计

每个 API 模块都是独立的单元，包含：

```
src/server/modules/posts/
├── index.ts              # 模块导出和元数据
├── posts.handlers.ts     # 业务逻辑
├── posts.routes.ts       # 路由定义
├── posts.openapi.ts      # OpenAPI 规范
└── posts.test.ts         # 单元测试
```

### 自动化 OpenAPI 文档

- 访问 `/api/docs` 查看完整的 API 文档
- 使用 `@scalar/hono-api-reference` 提供交互式文档界面
- 自动生成类型安全的客户端代码

### 智能文件处理

根据选择的功能，CLI 会智能地：
- 移除未使用的依赖
- 清理相关的导入语句
- 调整 TypeScript 类型定义
- 更新配置文件

## 🛠️ 开发指南

### 核心开发流程

#### 1. **定义数据模型**（如果包含数据库）

```typescript
// src/server/db/tables/posts.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
```

#### 2. **生成数据库类型和验证模式**

```bash
bun run db:generate      # 生成 Drizzle 迁移
bun run db:push:local    # 应用到本地数据库
```

框架会自动使用 drizzle-zod 生成验证模式：

```typescript
// 自动生成在 src/server/schemas/database/
export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);
```

#### 3. **创建 API 模块**

使用模块生成器快速创建：

```bash
bun run gen:module posts
```

或手动创建：

```typescript
// src/server/modules/posts/posts.routes.ts
import { APIBuilder } from "@/server/lib/api-builder";

const builder = new APIBuilder({ endpoint: "posts" });

builder
  .get("/", getPostsHandler)
  .openapi(getPostsOpenAPI)
  
builder
  .post("/", createPostHandler)
  .input(insertPostSchema, "json")
  .openapi(createPostOpenAPI);

export const postsRoutes = builder.build();
```

#### 4. **生成前端客户端**

```bash
bun run gen:api  # 生成 OpenAPI 规范和客户端代码
```

#### 5. **在前端使用类型安全的 Hooks**

```tsx
// src/client/components/posts-list.tsx
import { useGetPosts } from "@/generated/endpoints/posts/posts";

export function PostsList() {
  const { data, isLoading, error } = useGetPosts();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data?.posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 📦 项目结构

```
my-app/
├── src/
│   ├── client/              # React 前端（full-stack）
│   │   ├── components/      # UI 组件
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # 工具函数
│   │   └── routes/         # TanStack Router 页面
│   ├── generated/          # 自动生成的代码
│   │   ├── endpoints/      # Orval 生成的 API 客户端
│   │   ├── schemas/        # TypeScript 类型
│   │   └── routeTree.gen.ts # 路由类型
│   └── server/             # Hono API
│       ├── config/         # 配置文件
│       ├── core/           # 核心功能
│       ├── db/            # 数据库（可选）
│       ├── lib/           # 共享工具
│       ├── middleware/    # 中间件
│       ├── modules/       # API 模块
│       ├── schemas/       # Zod 验证模式
│       └── types/         # TypeScript 类型
├── scripts/               # 工具脚本
├── .dev.vars             # 本地环境变量
├── drizzle.config.ts     # 数据库配置（可选）
├── orval.config.ts       # API 客户端生成配置
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml         # Cloudflare Workers 配置
```

## 🔧 常用命令

### 开发命令

```bash
# 开发
bun run dev               # 启动开发服务器（端口 5173）
bun run build             # 构建生产版本
bun run preview           # 预览构建结果
bun run deploy            # 部署到 Cloudflare Workers

# 类型和代码生成
bun run gen:types         # 生成 Cloudflare 绑定类型
bun run gen:routes        # 生成 TanStack Router 类型（full-stack）
bun run gen:api          # 生成 OpenAPI 规范和客户端
bun run gen:module <name> # 生成新的 API 模块

# 数据库操作（如果包含）
bun run db:generate       # 生成 Drizzle 迁移
bun run db:push:local     # 应用迁移到本地
bun run db:push:remote    # 应用迁移到生产
bun run db:studio         # 打开 Drizzle Studio
bun run db:reset:local    # 重置本地数据库

# 代码质量
bun run typecheck         # TypeScript 类型检查
bun run lint              # Biome 代码检查
bun run lint:fix          # 自动修复代码风格
bun run test              # 运行测试
```

## 🌟 高级特性

### Zod v4 完美集成

新版本完美支持 Zod v4，通过子路径导入避免版本冲突：

```typescript
import { z } from "zod/v4";

// 与 drizzle-zod 无缝集成
export const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().optional(),
});
```

### 自动化错误处理

全局错误处理器自动捕获并格式化所有错误：

```typescript
// 统一的错误响应格式
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Title is required",
    timestamp: "2024-01-01T00:00:00.000Z",
    path: "/api/posts"
  }
}
```

### 认证集成（可选）

使用 Better Auth 提供完整的认证解决方案：
- Discord OAuth（默认）
- 会话管理
- 中间件保护
- 类型安全的用户信息

### 智能路由保护

```typescript
// 默认所有路由需要认证
const PUBLIC_API_ROUTES = ["/api/hello", "/api/auth/*"];

// 在中间件中自动应用
app.use(authGuard({ publicRoutes: PUBLIC_API_ROUTES }));
```

## 🚀 部署

### 准备工作

1. **创建 Cloudflare D1 数据库**（如果需要）
```bash
wrangler d1 create my-app-db
```

2. **更新 wrangler.toml**
```toml
[[d1_databases]]
binding = "DB"
database_name = "my-app-db"
database_id = "你的数据库ID"
```

3. **配置环境变量**
```bash
# 创建 .prod.vars 文件
cp .dev.vars .prod.vars
# 编辑并设置生产环境值
```

### 部署步骤

```bash
# 推送环境变量到 Cloudflare
bun run env:push:cf

# 推送数据库迁移（如果有）
bun run db:push:remote

# 部署应用
bun run deploy
```

## 📚 进阶指南

### 添加新功能模块

1. 使用模块生成器：
```bash
bun run gen:module users --schema-name user
```

2. 模块会自动注册并生成：
   - CRUD 路由
   - OpenAPI 文档
   - 类型定义
   - 测试文件

### 自定义中间件

```typescript
// src/server/middleware/custom.ts
export const customMiddleware = createMiddleware(async (c, next) => {
  // 中间件逻辑
  c.set("customData", someValue);
  await next();
});
```

### 扩展 BaseContext

```typescript
// src/server/lib/types.ts
export interface BaseContext {
  Bindings: CloudflareBindings;
  Variables: {
    // 添加自定义变量
    customData: string;
    analytics: AnalyticsEngine;
  };
}
```

## 🤝 贡献指南

我们欢迎贡献！项目特点：
- 模块化架构，易于扩展
- 完整的类型定义
- 全面的测试覆盖
- 清晰的代码组织

## 📝 许可证

MIT

---

<p align="center">
  使用 ❤️ 构建，为现代 Web 开发者打造
</p>