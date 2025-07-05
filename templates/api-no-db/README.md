# Vinoflare v2 API (No Auth No DB) - Modern Stateless API Template for Cloudflare Workers

一个基于 Cloudflare Workers 的现代无状态 API 服务模板，集成了 Hono 和完整的类型安全体系。

## 🚀 特性

- **边缘优先**: 基于 Cloudflare Workers，享受全球边缘网络的性能优势
- **类型安全**: API 的端到端类型安全
- **模块化架构**: 清晰的模块化设计，易于扩展和维护
- **自动化代码生成**: 一键生成无状态模块和类型定义
- **现代技术栈**: Hono + TypeScript
- **API 文档**: 自动生成 OpenAPI 文档和交互式 UI
- **无需认证**: 所有 API 端点均为公开访问
- **无需数据库**: 专注于无状态 API 服务

## 📋 前置要求

- [Bun](https://bun.sh/) - 推荐使用最新版本
- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) - 会随 bun install 自动安装

## 🛠️ 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 启动开发服务器

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
│   │   ├── lib/             # 服务端工具库
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
# 生成新的无状态模块（推荐）
bun run gen:module <模块名>

# 生成 OpenAPI 规范
bun run gen:api

# 生成 Cloudflare 绑定类型
bun run gen:types
```


## 📦 创建新模块

使用脚手架快速创建新模块：

```bash
bun run gen:module products
```

这会自动生成：
- ✅ 无状态处理器
- ✅ RESTful API 路由
- ✅ Zod 验证模式
- ✅ OpenAPI 文档
- ✅ 单元测试文件

生成后需要运行 `bun run gen:api` 更新 OpenAPI 规范

## 📝 API 文档

启动开发服务器后，访问 http://localhost:5173/api/docs 查看：
- 交互式 API 文档（Scalar UI）
- 在线测试 API 端点
- 查看请求/响应模式

## 🚀 部署到 Cloudflare

### 部署应用

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
- 导出类型供客户端使用

### 错误处理
- 使用 `HTTPException` 处理标准 HTTP 错误
- 自定义错误继承 `APIError` 类
- 全局错误处理器确保一致的错误格式

### 性能优化
- 利用 Cloudflare Workers 的边缘计算能力
- 实施适当的缓存策略
- 无状态设计确保最佳性能

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
// 直接调用 API（无需认证）
const response = await fetch('http://localhost:5173/api/hello');
const data = await response.json();
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT