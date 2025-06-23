# Vinoflare - 现代化 Hono 全栈开发模板

一个经过**生产级优化**的现代化、类型安全的全栈应用开发模板，使用 **Vite + Hono + Cloudflare Workers + Better Auth + Tanstack Router + Tankstack Form** 技术栈，实现无缝的端到端类型安全开发体验。

## 🚀 Vinoflare 是什么？

**Vinoflare** = **Vi**te + Ho**no** + Cloud**flare**，是一个完整的全栈开发解决方案：

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
bun i

# 3. 一键初始化项目
bun setup
# 这个命令会自动：
# - 创建 .dev.vars 配置文件
# - 生成并应用数据库迁移
# - 生成所有必要的类型文件
# - 生成 API 客户端代码

# 4. 配置环境变量
# 编辑 .dev.vars 添加你的 Discord OAuth 信息

# 5. 启动开发服务器
bun dev
```

### 关于自动生成的文件

以下文件会在开发过程中自动生成，**不需要**提交到版本控制：

- **assets-manifest.json** - 客户端资源路径映射
  - 开发时：`bun dev` 自动生成默认版本
  - 生产时：`bun build` 根据实际打包结果更新
  
- **src/routeTree.gen.ts** - TanStack Router 路由类型
  - 由 TanStack Router Plugin 自动生成
  
- **worker-configuration.d.ts** - Cloudflare Workers 类型定义
  - 运行 `bun gen:types` 生成
  
- **openapi.json** - OpenAPI 规范文件
  - 运行 `bun gen:openapi` 生成
  
- **src/hooks/api/** - Orval 生成的 API 客户端
  - 运行 `bun gen:api` 生成

这些文件都已添加到 `.gitignore`，确保版本控制的整洁性。

> 因为本地开发的响应速度过快，有时会错过许多部署之后因网络延迟而导致的问题，为了模拟延迟，本框架添加了`src/server/middleware/delay.ts`延迟路由来模拟响应，如不需要，可在`src/server/lib/create-app.ts`中把延迟路由注释，或者设置为`app.use(delayMiddleware({fixed: 0}));`

## 🎯 核心概念

### 1. 统一上下文类型系统

这个框架创建了统一的 Hono 上下文类型系统：

```typescript
// src/server/lib/types.ts
export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		user?: AuthUser;
		session?: AuthSession;
    // 后续有任何类型打算嵌入
	};
}
```

### 2. 自动生成 OpenAPI 文档
访问 `/doc` 即可看到 OpenAPI 完整文档，访问`/reference` 即可看到类 Swagger UI 的应用；
文档配置代码位于 `src/server/lib/configure-open-api.ts`；
注意，为配合 Orval 和其他根据 OpenAPI 自动生成类型文件，`src/server/middleware/dynamic-openapi.ts` 会劫持 /doc 路由并植入正确的 server 地址

### 3. Hono 路由集中管理
如想添加任何全局的 Hono 路由，可在`src/server/lib/create-app.ts`中添加，具体可见 [Hono 官网](https://hono.dev/)。

## 4. 前端类型自动生成
本框架使用 [Orval](https://orval.dev/) 基于 OpenAPI 规范自动生成类型安全的 API 客户端和 React Query Hooks。

```bash
# 生成 API 类型和客户端
bun gen:api           # 同时生成 OpenAPI 规范和客户端代码
bun gen:openapi       # 仅生成 OpenAPI 规范 (openapi.json)
bun gen:client        # 仅生成客户端代码 (需要先有 openapi.json)
```

生成的代码位于 `src/hooks/api/` 目录，包含：
- `endpoints/` - 按标签分组的 API 端点函数和 hooks
- `schemas/` - TypeScript 类型定义
- `custom-instance.ts` - 基于 Fetch API 的 HTTP 客户端

### 常用开发命令

```bash
# 数据库操作
bun db:generate        # 生成 Drizzle 迁移文件
bun db:push:local      # 应用迁移到本地 D1 数据库
bun db:push:remote     # 应用迁移到生产 D1 数据库
bun db:studio:local    # 使用 Drizzle Studio 查看本地数据库
bun db:studio:remote   # 使用 Drizzle Studio 查看生产数据库

# 类型生成
bun gen:types         # 生成 Cloudflare 绑定类型
bun gen:api           # 生成 OpenAPI 规范和 API 客户端

# 开发和构建
bun dev               # 启动开发服务器 (端口 5173)
bun build             # 构建客户端资源
bun preview           # 预览构建结果

# 代码质量
bun typecheck         # TypeScript 类型检查
bun lint              # 运行 Biome 代码检查
bun lint:fix          # 自动修复代码风格问题
bun test              # 运行 Vitest 测试
bun test:watch        # 监听模式运行测试
```

## 🚀 部署指南

### 部署前准备

1. **创建 Cloudflare D1 数据库**
```bash
# 确保已安装并登录 wrangler
npm install -g wrangler
wrangler login

# 创建 D1 数据库
wrangler d1 create vinoflare-db
```

2. **更新配置文件**
创建数据库后，将输出的信息更新到 `wrangler.toml`：
```toml
[[d1_databases]]
binding = "DB"
database_name = "vinoflare-db"
database_id = "你的数据库ID"
```

3. **配置环境变量**
```bash
# 复制并编辑生产环境变量
cp .dev.vars .prod.vars

# 编辑 .prod.vars，设置：
# ENVIRONMENT=production
# BETTER_AUTH_SECRET=生成32字符的安全密钥
# DISCORD_CLIENT_ID=你的Discord OAuth ID
# DISCORD_CLIENT_SECRET=你的Discord OAuth密钥
```

### 部署步骤

```bash
# 1. 生成必要的类型文件
bun gen:types

# 2. 同步密钥到 Cloudflare
bun env:sync:remote

# 3. 推送数据库架构到生产环境
bun db:push:remote

# 4. 部署到 Cloudflare Workers
bun deploy
```

### 持续部署 (推荐)

#### 方案 1: Cloudflare Pages 集成
1. 在 Cloudflare Dashboard 中连接你的 GitHub 仓库
2. 设置构建配置：
   - 构建命令：`bun run build`
   - 构建输出目录：`dist/client`
   - 环境变量：在 Cloudflare Dashboard 中设置
3. 之后每次推送到主分支都会自动部署

#### 方案 2: GitHub Actions
1. 在 GitHub 仓库的 Settings > Secrets 中添加：
   - `CLOUDFLARE_API_TOKEN` - 从 Cloudflare 获取
   - `CLOUDFLARE_ACCOUNT_ID` - 你的账户 ID
   - `BETTER_AUTH_SECRET` - 认证密钥
   - `DISCORD_CLIENT_ID` - Discord OAuth ID
   - `DISCORD_CLIENT_SECRET` - Discord OAuth 密钥

2. 使用提供的 `.github/workflows/deploy.yml` 文件
3. 推送到 main 分支即可自动部署

**注意**: `bun build` 命令会自动生成所有必要的文件（类型、API 客户端等），无需手动生成

### 部署后验证

```bash
# 查看部署日志
wrangler tail

# 访问你的应用
# https://你的项目名.你的子域名.workers.dev
```

### 环境变量清单

**本地 Node 开发环境** (`.env`):
- `CLOUDFLARE_ACCOUNT_ID`: 登录 Cloudflare 后台，在账户总览或 URL 里可以找到
- `CLOUDFLARE_DATABASE_ID`: 在 D1 数据库详情页可以找到
- `CLOUDFLARE_D1_TOKEN`: 在 My Profile -> API Tokens 创建

**Cloudflare Workers 开发环境** (`.dev.vars`):
- `ENVIRONMENT`：[devlopment, production]，判断开发环境或生产环境
- `BETTER_AUTH_SECRET`: 32字符随机密钥
- `DISCORD_CLIENT_ID/SECRET`: Discord OAuth 凭据

**生产环境** (需设置`.prod.vars`并使用`bun env:sync:remote`将密钥同步到Cloudflare Secrets):
- 同`.dev.vars`
- `ENVIRONMENT`：同`.dev.vars`
- `BETTER_AUTH_SECRET`: 同`.dev.vars`
- `DISCORD_CLIENT_ID/SECRET`: 同`.dev.vars`

## 📝 开发指南

### 推荐的开发流程

1. **设计数据模型**
   - 编辑 `src/server/db/schema.ts` 定义数据表结构
   - 使用 Drizzle ORM 的类型安全 API

2. **数据库迁移**
   ```bash
   bun db:generate      # 生成迁移 SQL
   bun db:push:local    # 应用到本地数据库
   ```

3. **创建 API 路由**
   - 在 `src/server/routes/` 创建新路由
   - 使用 `@hono/zod-openapi` 定义类型安全的端点
   - 路由会自动生成 OpenAPI 文档

4. **生成前端类型**
   ```bash
   bun gen:types       # 生成 Cloudflare 绑定类型
   bun gen:api         # 生成 API 客户端和 hooks
   ```

5. **实现前端功能**
   - 使用生成的 hooks 调用 API
   - 在 `src/routes/` 创建页面
   - 在 `src/components/` 创建组件

### 项目结构说明

```
src/
├── server/              # 后端代码
│   ├── db/             # 数据库 schema 和配置
│   ├── routes/         # API 路由定义
│   ├── middleware/     # 中间件（认证、延迟等）
│   └── lib/            # 核心工具和类型
├── hooks/              # React hooks
│   └── api/            # Orval 生成的 API 客户端
├── routes/             # TanStack Router 页面
└── components/         # React 组件
```

## 🔧 已知问题

### 数据库 schema 自动化
因为 zod 升级到 v4 版本之后，drizzle-zod 和 @hono/zod-openapi 产生了不兼容，导致在`src/server/db/schema`中，无法通过 drizzle-zod 来自动生成 schema，所以目前暂时只能通过将 drizzle-zod 的版本锁定在 v0.7.1 来解决。

### 认证问题修复

当因为在开发过程中切换数据库，遇到 JWT 密钥问题时，可通过删除 “.wrangler” 文件夹的方式重置数据库外，也可使用以下脚本清理数据库：

```bash
wrangler d1 execute vinoflare --local --command="DELETE FROM jwks;"
```

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**Vinoflare** - 让全栈开发变成一种享受 🚀
