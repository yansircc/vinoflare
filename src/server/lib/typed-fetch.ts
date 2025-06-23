// 类型安全的 fetch 包装器，从 OpenAPI 路由提取类型
import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { z } from "zod";

// 从 OpenAPI 路由提取响应类型
type ExtractResponseType<T extends RouteConfig> = T extends {
  responses: {
    200: {
      content: {
        "application/json": {
          schema: infer S;
        };
      };
    };
  };
}
  ? S extends z.ZodType<infer U>
    ? U
    : never
  : never;

// 从 OpenAPI 路由提取请求类型
type ExtractRequestType<T extends RouteConfig> = T extends {
  request: {
    body: {
      content: {
        "application/json": {
          schema: infer S;
        };
      };
    };
  };
}
  ? S extends z.ZodType<infer U>
    ? U
    : never
  : never;

// 创建类型安全的 fetch 函数
export function createTypedFetch<T extends RouteConfig>(
  route: T,
  baseUrl: string = ""
) {
  const method = route.method.toUpperCase();
  const path = route.path;

  return async (options?: {
    params?: Record<string, string | number>;
    body?: ExtractRequestType<T>;
  }): Promise<ExtractResponseType<T>> => {
    let url = `${baseUrl}${path}`;
    
    // 替换路径参数
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value));
      });
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  };
}