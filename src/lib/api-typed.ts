// 使用 OpenAPI 路由定义，但不通过 Hono RPC
import * as taskRoutes from "@/server/routes/tasks/tasks.routes";
import { createTypedFetch } from "@/server/lib/typed-fetch";

// 预创建类型安全的 API 函数
export const api = {
  tasks: {
    list: createTypedFetch(taskRoutes.list),
    create: createTypedFetch(taskRoutes.create),
    get: createTypedFetch(taskRoutes.getOne),
    update: createTypedFetch(taskRoutes.patch),
    delete: createTypedFetch(taskRoutes.remove),
  },
} as const;