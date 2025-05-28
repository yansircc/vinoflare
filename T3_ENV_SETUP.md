# T3 Env 环境变量管理

## 概述

本项目使用 `@t3-oss/env-core` 来管理环境变量，提供类型安全的环境变量验证和访问。这确保了在不同环境（本地开发、Cloudflare Workers 生产环境）中的一致性和安全性。

## 🏗️ 架构设计

### 文件结构
```
src/lib/
├── env.ts          # 服务器端环境变量配置
└── env-client.ts   # 客户端环境变量配置

.dev.vars           # 本地开发环境变量
wrangler.jsonc      # Cloudflare Workers 生产环境变量
```

### 环境变量分离
- **服务器端变量**: 只在服务器端可用，包含敏感信息
- **客户端变量**: 客户端和服务器端都可用，必须以 `VITE_` 前缀开头

## 📝 配置详解

### 服务器端配置 (`src/lib/env.ts`)

```typescript
export const env = createEnv({
  server: {
    APP_URL: z.string().url().default("http://localhost:5174"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  clientPrefix: "VITE_",
  client: {
    VITE_API_URL: z.string().url().optional(),
  },
  // ...
})
```

### 客户端配置 (`src/lib/env-client.ts`)

```typescript
export const clientEnv = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_URL: z.string().url().optional(),
  },
  // ...
})
```

## 🌍 环境配置

### 本地开发环境 (`.dev.vars`)

```bash
# 本地开发环境变量
APP_URL=http://localhost:5174
NODE_ENV=development
VITE_API_URL=http://localhost:5174/api
```

### 生产环境 (`wrangler.jsonc`)

```json
{
  "vars": {
    "APP_URL": "https://try-hono.yansir.workers.dev",
    "NODE_ENV": "production",
    "VITE_API_URL": "https://try-hono.yansir.workers.dev/api"
  }
}
```

## 🔧 使用方法

### 在服务器端代码中使用

```typescript
import { env } from './lib/env'

// 类型安全的环境变量访问
const appUrl = env.APP_URL        // string
const nodeEnv = env.NODE_ENV      // "development" | "production" | "test"
```

### 在客户端代码中使用

```typescript
import { clientEnv } from './lib/env-client'

// 只能访问客户端变量
const apiUrl = clientEnv.VITE_API_URL  // string | undefined
```

## 🚀 部署流程

### 本地开发
```bash
# 启动本地开发服务器
npm run dev
# 环境变量从 .dev.vars 加载
```

### 部署到 Cloudflare Workers
```bash
# 构建并部署
npm run deploy
# 环境变量从 wrangler.jsonc 的 vars 配置加载
```

## 🔍 调试和验证

### 环境信息端点
访问 `/api/env` 可以查看当前环境的配置信息：

```json
{
  "app_url": "https://try-hono.yansir.workers.dev",
  "node_env": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 控制台日志
客户端会在控制台输出 API 基础 URL，便于调试：
```
🔗 API Base URL: https://try-hono.yansir.workers.dev
```

## ✨ 特性优势

### 🎯 类型安全
- 编译时类型检查
- 自动类型推断
- IDE 智能提示

### 🔒 安全性
- 服务器变量不会泄露到客户端
- 客户端变量必须显式声明
- 运行时验证

### 🌐 环境适配
- 自动检测运行环境
- 不同环境使用不同配置
- 无缝切换本地/生产环境

### 🛡️ 错误处理
- 启动时验证所有环境变量
- 清晰的错误信息
- 防止运行时错误

## 📋 环境变量列表

| 变量名 | 类型 | 环境 | 描述 | 默认值 |
|--------|------|------|------|--------|
| `APP_URL` | string | 服务器 | 应用基础 URL | `http://localhost:5174` |
| `NODE_ENV` | enum | 服务器 | 运行环境 | `development` |
| `VITE_API_URL` | string? | 客户端 | API 基础 URL | 可选 |

## 🔄 迁移指南

### 从直接使用 process.env 迁移

**之前:**
```typescript
const appUrl = process.env.APP_URL || 'http://localhost:5174'
```

**现在:**
```typescript
import { env } from './lib/env'
const appUrl = env.APP_URL  // 类型安全，有默认值
```

### 添加新的环境变量

1. 在 `src/lib/env.ts` 中添加验证规则
2. 在 `.dev.vars` 中添加本地开发值
3. 在 `wrangler.jsonc` 中添加生产环境值
4. 在代码中使用 `env.NEW_VAR`

## 🐛 常见问题

### Q: 客户端无法访问服务器变量
**A**: 这是设计如此，服务器变量不应该暴露给客户端。如果需要在客户端使用，请添加 `VITE_` 前缀的客户端变量。

### Q: 环境变量验证失败
**A**: 检查 `.dev.vars` 和 `wrangler.jsonc` 中的变量是否符合 Zod schema 定义的规则。

### Q: 本地开发和生产环境 URL 不一致
**A**: 这是正常的，本地使用 `localhost:5174`，生产使用 Cloudflare Workers 域名。

## 📚 相关文档

- [T3 Env 官方文档](https://env.t3.gg/)
- [Zod 验证库](https://zod.dev/)
- [Cloudflare Workers 环境变量](https://developers.cloudflare.com/workers/configuration/environment-variables/) 