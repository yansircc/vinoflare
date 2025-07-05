# Vinoflare v2 - Modern Full-Stack Template for Cloudflare Workers (NO-AUTH NO-DB Version)

一个基于 Cloudflare Workers 的现代全栈应用模板，集成了 React、Hono 和完整的类型安全体系。**此版本已移除所有身份认证和数据库功能，适用于无状态 API 服务。**

## 🚀 特性

- **边缘优先**: 基于 Cloudflare Workers，享受全球边缘网络的性能优势
- **类型安全**: 从 API 到前端的端到端类型安全
- **模块化架构**: 清晰的模块化设计，易于扩展和维护
- **自动化代码生成**: 一键生成无状态模块、API 客户端和类型定义
- **现代技术栈**: React 19 + TypeScript + Vite + TanStack Router
- **无需认证**: 所有 API 端点公开访问
- **无需数据库**: 专注于无状态 API 服务
- **API 文档**: 自动生成 OpenAPI 文档和交互式 UI

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
# 环境标识
ENVIRONMENT=development
```

### 3. 启动开发服务器

```bash
bun run dev
```

访问 http://localhost:5173 查看应用

## 🏗️ 项目结构

```
src/
├── client/               # React 前端应用
│   ├── components/       # UI 组件
│   ├── hooks/           # 自定义 Hooks 和 API 集成
│   ├── lib/             # 客户端工具库
│   └── routes/          # 页面路由（TanStack Router）
├── server/              # Hono 后端应用
│   ├── config/          # 配置文件
│   ├── core/            # 核心功能（模块加载、错误处理）
│   ├── lib/             # 服务端工具库
│   ├── middleware/      # 中间件
│   ├── modules/         # 功能模块（每个模块独立）
│   ├── routes/          # 路由配置
│   ├── schemas/         # Zod 验证模式
│   └── types/           # TypeScript 类型定义
└── generated/           # 自动生成的代码
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

> ⚠️ **注意**: 请使用 `bun run test` 而不是 `bun test`。本项目使用 Vitest 配合 Cloudflare Workers 进行测试，需要特殊配置。

### 代码生成

```bash
# 生成新的无状态模块（推荐）
bun run gen:module <模块名>

# 生成 API 客户端和类型
bun run gen:api

# 生成路由类型
bun run gen:routes

# 生成 Cloudflare 绑定类型
bun run gen:types
```


## 📦 创建新模块

使用脚手架快速创建新的无状态模块：

```bash
bun run gen:module <模块名>
```

这会自动生成：
- ✅ 模块定义和处理器
- ✅ RESTful API 路由
- ✅ Zod 验证模式
- ✅ OpenAPI 文档
- ✅ 单元测试文件

生成后需要运行 `bun run gen:api` 更新客户端类型。


## 📝 API 文档

启动开发服务器后，访问 http://localhost:5173/api/docs 查看：
- 交互式 API 文档（Scalar UI）
- 在线测试 API 端点
- 查看请求/响应模式

## 🚀 部署到 Cloudflare

### 1. 设置生产环境变量

```bash
# 设置环境标识
wrangler secret put ENVIRONMENT
# 输入: production
```

### 2. 部署应用

```bash
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
- API 模式是类型的唯一来源
- 使用 Zod 进行运行时验证
- 通过 Orval 生成类型安全的 API 客户端

### 错误处理
- 使用 `HTTPException` 处理标准 HTTP 错误
- 自定义错误继承 `APIError` 类
- 全局错误处理器确保一致的错误格式

### 性能优化
- 利用 Cloudflare Workers 的边缘计算能力
- 使用 Vite 的代码分割优化包大小
- 实施适当的缓存策略

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT