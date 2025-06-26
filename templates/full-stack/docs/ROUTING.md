# 路由系统说明

本项目使用 Hono 作为服务器框架，结合 React Router 处理前端路由。

## 目录结构

```
src/
├── index.tsx                 # 主入口文件，配置所有路由
├── server/
│   ├── config/
│   │   └── routes.ts        # 路由配置（认证、公开路由等）
│   ├── routes/
│   │   └── api.ts           # API 路由聚合
│   └── modules/             # 功能模块
│       ├── auth/            # 认证模块
│       ├── posts/           # 文章模块
│       └── hello/           # 示例模块
└── client/                  # React 前端
```

## 添加新的 API 路由

### 1. 创建新模块

在 `src/server/modules/` 下创建新目录，例如 `products`：

```typescript
// src/server/modules/products/products.routes.ts
import { APIBuilder } from "@/server/lib/api-builder";

export const createProductsModule = () => {
  const builder = new APIBuilder();
  
  builder.addRoute({
    method: "get",
    path: "/",
    handler: async (c) => {
      // 你的业务逻辑
      return c.json({ products: [] });
    },
    openapi: {
      tags: ["Products"],
      summary: "获取产品列表",
      responses: {
        200: {
          description: "产品列表",
        },
      },
    },
  });
  
  return builder;
};
```

### 2. 注册模块

在 `src/server/routes/api.ts` 中注册：

```typescript
import { createProductsModule } from "../modules/products/products.routes";

export const createAPIApp = () => {
  const app = new Hono<BaseContext>();
  
  // ... 其他模块
  
  const productsModule = createProductsModule();
  app.route("/products", productsModule.getApp());
  
  // ...
};
```

### 3. 配置认证（如果需要）

在 `src/server/config/routes.ts` 中添加：

```typescript
export const PROTECTED_API_ROUTES = [
  "/api/posts/*",
  "/api/auth/user",
  "/api/products/*",  // 新增：保护产品相关路由
] as const;
```

## 路由类型说明

### API 路由 (`/api/*`)
- 所有后端 API 都在 `/api` 前缀下
- 使用 `APIBuilder` 构建，自动生成 OpenAPI 文档
- 支持认证中间件保护

### 静态资源路由
- `/assets/*` - 前端打包资源
- `/.vite/*` - Vite 相关文件

### 前端路由
- 所有其他路由都交给 React Router 处理
- 支持 SSR（服务端渲染）

## 常见问题

### Q: 如何添加不需要在 OpenAPI 文档中显示的内部路由？
A: 在 `addRoute` 时不添加 `openapi` 属性即可。

### Q: 如何处理文件上传？
A: 使用 Hono 的内置功能：
```typescript
handler: async (c) => {
  const body = await c.req.parseBody();
  const file = body.file as File;
  // 处理文件
}
```

### Q: 如何添加自定义中间件？
A: 在模块创建时传入：
```typescript
const builder = new APIBuilder({
  middleware: [yourMiddleware],
});
```

## 最佳实践

1. **模块化**: 每个功能创建独立的模块
2. **类型安全**: 使用 Zod 进行参数验证
3. **文档化**: 为每个路由添加 OpenAPI 定义
4. **认证**: 在配置文件中集中管理受保护的路由
5. **错误处理**: 使用 `HTTPException` 统一处理错误