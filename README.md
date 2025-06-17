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
bun install

# 3. 配置环境变量
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 添加你的 Discord OAuth 信息

# 可选：如需使用`bun db:studio:remote`链接远程数据库，需要配置 env 的环境变量
# 注意，因为 env 中包含了 cloudflare 的认证信息，而我们申请的 token 的权限并包含创建 d1 的权限
# 所以，此处创建 .env.local 而不能创建 .env 是为了绕开 wrangler 命令的局限
cp .env.example .env.local

# 4. 创建数据库，运行此命令前，先确保全局安装了 wrangler 并且绑定了 cloudflare 账号，具体参考 ChatGPT
# 此处注意，创建成功后，需把对应的 database_name & CLOUDFLARE_DATABASE_ID 填入 wrangler.toml
# 再把 CLOUDFLARE_DATABASE_ID 填入 .env.local
wrangler d1 create vinoflare-db

# 5. 生成类型和迁移
bun cf-typegen
bun db:generate
bun db:push:local

# 6. 启动开发服务器
bun dev
```

### 关于 assets-manifest.json

本项目使用 `assets-manifest.json` 来管理客户端资源的路径映射。这个文件会在构建时自动生成，包含了打包后的 JS 和 CSS 文件路径。

- **开发环境**: 运行 `bun dev` 时会自动生成一个默认的 assets-manifest.json 文件
- **生产环境**: 运行 `bun build` 时会根据实际构建结果更新这个文件
- **版本控制**: 该文件已被加入 `.gitignore`，避免因文件内容变化导致的版本冲突
- **模板文件**: `src/assets-manifest.example.json` 提供了文件格式示例

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
本框架使用 [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview) 自动生成 React Query Hooks，如修改了`src/server`中的任何和路由相关的代码，可使用`bun cf-typegen`来自动生成所有前端类型。

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

# 测试相关
bun run test           # 使用cloudflare testing进行自动化测试
```

## 🚀 部署到生产

### Cloudflare Workers 部署

```bash
# 创建 .prod.vars，注意，需要配置 ENVIRONMENT 为 production
cp .dev.vars .prod.vars

# 同步 .prod.vars 密钥到云端
bun env:sync:remote

# 4. 推送数据库架构
bun db:push:remote

# 5. 构建和部署
# 不需要 bun run build 构建，构建已包含在 deploy 命令中
bun run deploy
```

> 如果部署到 cloudflare workers 之后链接了 github 仓库中的项目，后续不再需要手动构建部署，github 推送后，项目即可立即同步。

### 环境变量清单

**本地 Node 开发环境** (`.env.local`):
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

## 🔄 更新和迁移

### 开发工作流

推荐的开发顺序：
1. **设计数据模型** → `src/server/db/schema.ts`
2. **生成迁移** → `bun db:generate && bun db:push:local`
3. **创建路由** → `src/server/routers/`
4. **生成类型** → `bun apigen`
5. **实现前端** → `components/` 和 `routes/`

## 🔧 已知问题

### 数据库 schema 自动化
因为 zod 升级到 v4 版本之后，drizzle-zod 和 @hono/zod-openapi 产生了不兼容，导致在`src/server/db/schema`中，无法通过 drizzle-zod 来自动生成 schema，所以目前暂时只能通过将 drizzle-zod 的版本锁定在 v0.7.1 来解决。

### 认证问题修复

当因为在开发过程中切换数据库，遇到 JWT 密钥问题时，除了可以通过删除 “.wrangler” 文件夹的方式重置数据库外，也可使用内置脚本：

```bash
# 重置认证数据 (清理旧的 JWT 密钥)
./scripts/reset-auth.sh

# 或手动清理
wrangler d1 execute vinoflare --local --command="DELETE FROM jwks;"
```

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**Vinoflare** - 让全栈开发变成一种享受 🚀
