# Vinoflare v2 API - Modern API Template for Cloudflare Workers

一个基于 Cloudflare Workers 的现代 API 服务模板，集成了 Hono、Drizzle ORM、Better Auth 和完整的类型安全体系。

## 🚀 特性

- **边缘优先**: 基于 Cloudflare Workers，享受全球边缘网络的性能优势
- **类型安全**: 从数据库到 API 的端到端类型安全
- **模块化架构**: 清晰的模块化设计，易于扩展和维护
- **自动化代码生成**: 一键生成 CRUD 模块和类型定义
- **现代技术栈**: Hono + TypeScript + Drizzle ORM
- **身份认证**: 集成 Better Auth，支持 Discord OAuth
- **API 文档**: 自动生成 OpenAPI 文档和交互式 UI
- **API 专注**: 纯 API 服务，无前端代码，适合作为微服务或 BFF

## 📋 前置要求

- [Bun](https://bun.sh/) - 推荐使用最新版本
- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) - 会随 bun install 自动安装

## 🛠️ 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 环境配置

创建 `.dev.vars` 文件（用于本地开发）：

```env
# 身份认证密钥（生成一个随机字符串）
BETTER_AUTH_SECRET=your-secret-key-here

# Discord OAuth（可选，如需使用 Discord 登录）
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# 环境标识
ENVIRONMENT=development
```

### 3. 数据库设置

```bash
# 生成数据库迁移
bun run db:generate

# 应用迁移到本地数据库
bun run db:push:local
```

### 4. 启动开发服务器

```bash
bun run dev
```

API 服务将在 http://localhost:5173 启动

- API 文档：http://localhost:5173/api/docs
- 健康检查：http://localhost:5173/api/health
- OpenAPI 规范：http://localhost:5173/api/openapi.json

## 🏗️ 项目结构

```
src/
├── server/              # API 服务端代码
│   ├── config/          # 配置文件
│   ├── core/            # 核心功能（模块加载、错误处理）
│   ├── db/              # 数据库表结构和迁移
│   ├── lib/             # 服务端工具库
│   ├── middleware/      # 中间件
│   ├── modules/         # 功能模块（每个模块独立）
│   ├── routes/          # 路由配置
│   ├── schemas/         # Zod 验证模式
│   └── types/           # TypeScript 类型定义
├── generated/           # 自动生成的代码
└── index.ts            # 应用入口
```

## 🔧 常用命令

### 开发命令

```bash
bun run dev              # 启动开发服务器
bun run build            # 构建生产版本
bun run typecheck        # TypeScript 类型检查
bun run lint             # 代码检查
bun run lint:fix         # 自动修复代码问题
bun run test             # 运行测试（使用 Vitest）
```

### 代码生成

```bash
# 生成新的 CRUD 模块（推荐）
bun run gen:module <模块名>

# 生成 OpenAPI 规范
bun run gen:api

# 生成 Cloudflare 绑定类型
bun run gen:types
```

### 数据库管理

```bash
bun run db:generate      # 生成迁移文件
bun run db:push:local    # 应用迁移到本地
bun run db:push:remote   # 应用迁移到生产
bun run db:studio        # 打开数据库管理界面
```

## 📦 创建新模块

使用脚手架快速创建新模块：

```bash
bun run gen:module products
```

这会自动生成：
- ✅ 完整的 CRUD 处理器
- ✅ RESTful API 路由
- ✅ 数据库表结构
- ✅ Zod 验证模式
- ✅ OpenAPI 文档
- ✅ 单元测试文件

生成后需要：
1. 运行 `bun run db:generate` 生成迁移
2. 运行 `bun run db:push:local` 应用迁移
3. 运行 `bun run gen:api` 更新 OpenAPI 规范

## 🔐 身份认证

项目集成了 Better Auth，默认配置了 Discord OAuth：

1. 在 [Discord Developer Portal](https://discord.com/developers/applications) 创建应用
2. 添加重定向 URL：`http://localhost:5173/api/auth/callback/discord`（生产环境使用实际域名）
3. 将 Client ID 和 Secret 添加到 `.dev.vars`

支持的认证功能：
- Discord OAuth 登录
- JWT 令牌
- 会话管理（7天有效期）
- 路由保护（默认所有 API 路由需要认证）

### 简单登录

```bash
# 获取 Discord 登录 URL
./auth.sh

# 在浏览器中打开显示的 URL 完成登录
# 登录后浏览器会自动保存 session cookie

# 退出登录：在浏览器中清除 localhost:5173 的 cookies 即可
```

详细使用说明请参考 [API_AUTH_GUIDE.md](./API_AUTH_GUIDE.md)

### 公开路由

以下路由无需认证即可访问（在 `src/server/config/routes.ts` 中配置）：
- `/api/hello` - 测试端点
- `/api/auth/*` - 认证相关端点
- `/api/openapi.json` - API 规范
- `/api/docs` - API 文档
- `/api/health` - 健康检查

## 📝 API 文档

启动开发服务器后，访问 http://localhost:5173/api/docs 查看：
- 交互式 API 文档（Scalar UI）
- 在线测试 API 端点
- 查看请求/响应模式

## 🚀 部署到 Cloudflare

### 1. 创建 D1 数据库

```bash
wrangler d1 create my-app-db
```

将输出的数据库 ID 更新到 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-app-db"
database_id = "你的数据库ID"
```

### 2. 设置生产环境变量

```bash
# 设置 Better Auth 密钥
wrangler secret put BETTER_AUTH_SECRET

# 设置 Discord OAuth（如果使用）
wrangler secret put DISCORD_CLIENT_ID
wrangler secret put DISCORD_CLIENT_SECRET
```

### 3. 部署应用

```bash
# 应用数据库迁移到生产环境
bun run db:push:remote

# 构建并部署
bun run build
bun run deploy
```

## 🎯 最佳实践

### 模块开发
- 每个功能模块保持独立，包含自己的处理器、路由和测试
- 使用 `APIBuilder` 创建路由，自动获得验证和文档
- 遵循 RESTful 设计原则

### 类型安全
- 数据库模式是类型的唯一来源
- 使用 `drizzle-zod` 从数据库模式生成验证
- 导出类型供客户端使用

### 错误处理
- 使用 `HTTPException` 处理标准 HTTP 错误
- 自定义错误继承 `APIError` 类
- 全局错误处理器确保一致的错误格式

### 性能优化
- 利用 Cloudflare Workers 的边缘计算能力
- 实施适当的缓存策略
- 使用连接池优化数据库访问

## 🔗 与前端集成

这是一个纯 API 项目，可以与任何前端框架集成：

### 使用 OpenAPI 客户端生成器
```bash
# 使用 openapi-typescript-codegen
npx openapi-typescript-codegen --input http://localhost:5173/api/openapi.json --output ./src/api

# 或使用 orval
npx orval --input http://localhost:5173/api/openapi.json --output ./src/api
```

### 手动集成示例
```typescript
// 获取认证会话
const response = await fetch('http://localhost:5173/api/auth/get-session', {
  credentials: 'include'
});

// 调用受保护的 API
const todos = await fetch('http://localhost:5173/api/todos', {
  headers: {
    'Authorization': `Bearer ${session.token}`
  }
});
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT