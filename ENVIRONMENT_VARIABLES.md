# 环境变量管理

## 概述

本项目使用简化的环境变量管理方案，直接使用 Zod 进行验证，避免了复杂的 t3-env 配置。这种方案更适合 Cloudflare Workers 环境，能够正确处理运行时环境变量。

## 🏗️ 架构设计

### 文件结构
```
src/lib/
└── env-simple.ts   # 简化的环境变量管理

.dev.vars           # 本地开发环境变量
wrangler.jsonc      # Cloudflare Workers 生产环境变量
```

### 核心特性
- ✅ **运行时读取**: 直接从 Cloudflare Workers 的 env 对象读取
- ✅ **类型安全**: 使用 Zod 进行验证和类型推断
- ✅ **环境适配**: 自动适配本地开发和生产环境
- ✅ **简单易用**: 无需复杂配置，开箱即用

## 📝 配置详解

### 环境变量 Schema (`src/lib/env-simple.ts`)

```typescript
const envSchema = z.object({
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_API_URL: z.string().url().optional(),
});
```

### 获取环境变量函数

```typescript
export function getEnv(workerEnv?: any) {
  // 在 Cloudflare Workers 中，环境变量通过 env 参数传递
  const rawEnv = workerEnv || {
    APP_URL: process.env.APP_URL || "http://localhost:5174",
    NODE_ENV: process.env.NODE_ENV || "development",
    VITE_API_URL: process.env.VITE_API_URL,
  };

  return envSchema.parse(rawEnv);
}
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
import { getEnv } from './lib/env-simple'

// 在 Hono 路由处理器中
app.get('/api/example', (c) => {
  const env = getEnv(c.env)  // 传入 Cloudflare Workers 的 env 对象
  
  console.log(env.APP_URL)     // 类型安全的访问
  console.log(env.NODE_ENV)    // "development" | "production" | "test"
  
  return c.json({ url: env.APP_URL })
})
```

### 在客户端代码中使用

```typescript
import { clientEnv } from './lib/env-simple'

// 客户端环境变量
const apiUrl = clientEnv.VITE_API_URL  // string | undefined
```

## 🚀 部署流程

### 本地开发
```bash
# 启动本地开发服务器
npm run dev
# 环境变量从 .dev.vars 自动加载
```

### 部署到 Cloudflare Workers
```bash
# 构建并部署
npm run deploy
# 环境变量从 wrangler.jsonc 的 vars 配置自动注入
```

## 🔍 调试和验证

### 环境信息端点
访问 `/api/env` 可以查看当前环境的配置信息：

**本地开发环境:**
```json
{
  "app_url": "http://localhost:5174",
  "node_env": "development",
  "vite_api_url": "http://localhost:5174/api",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**生产环境:**
```json
{
  "app_url": "https://try-hono.yansir.workers.dev",
  "node_env": "production",
  "vite_api_url": "https://try-hono.yansir.workers.dev/api",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## ✨ 优势对比

### 🆚 相比 t3-env 的优势

| 特性 | 简化方案 | t3-env |
|------|----------|--------|
| **配置复杂度** | ✅ 简单 | ❌ 复杂 |
| **Cloudflare Workers 兼容性** | ✅ 完美支持 | ⚠️ 需要特殊配置 |
| **运行时环境变量** | ✅ 正确读取 | ❌ 构建时固化 |
| **依赖数量** | ✅ 只需 Zod | ❌ 额外依赖 |
| **类型安全** | ✅ 完全支持 | ✅ 完全支持 |
| **学习成本** | ✅ 低 | ❌ 高 |

### 🎯 核心优势

1. **运行时灵活性**: 环境变量在运行时动态读取，而不是构建时固化
2. **Cloudflare Workers 原生支持**: 直接使用 Workers 的 env 对象
3. **简单明了**: 代码易读易维护，无需复杂配置
4. **类型安全**: 保持完整的 TypeScript 类型支持

## 📋 环境变量列表

| 变量名 | 类型 | 环境 | 描述 | 示例值 |
|--------|------|------|------|--------|
| `APP_URL` | string | 服务器 | 应用基础 URL | `https://try-hono.yansir.workers.dev` |
| `NODE_ENV` | enum | 服务器 | 运行环境 | `production` |
| `VITE_API_URL` | string? | 客户端 | API 基础 URL | `https://try-hono.yansir.workers.dev/api` |

## 🔄 添加新环境变量

1. 在 `src/lib/env-simple.ts` 的 `envSchema` 中添加验证规则
2. 在 `.dev.vars` 中添加本地开发值
3. 在 `wrangler.jsonc` 的 `vars` 中添加生产环境值
4. 在代码中使用 `getEnv(c.env).NEW_VAR`

## 🐛 常见问题

### Q: 为什么不使用 t3-env？
**A**: t3-env 在构建时固化环境变量，不适合 Cloudflare Workers 的运行时环境变量注入机制。我们的简化方案能正确处理运行时环境变量。

### Q: 如何确保类型安全？
**A**: 使用 Zod schema 进行验证，TypeScript 会自动推断类型，提供完整的类型安全保障。

### Q: 客户端如何访问环境变量？
**A**: 客户端只能访问以 `VITE_` 前缀的环境变量，通过 `clientEnv` 对象访问。

## 📚 相关文档

- [Zod 验证库](https://zod.dev/)
- [Cloudflare Workers 环境变量](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Vite 环境变量](https://vitejs.dev/guide/env-and-mode.html) 