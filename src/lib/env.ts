import { z } from "zod";

/**
 * 简化的环境变量管理
 * 直接从运行时环境读取，避免构建时固化
 */

// 环境变量验证 schema
const envSchema = z.object({
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_API_URL: z.string().url().optional(),
});

/**
 * 安全地获取 process.env（仅在 Node.js 环境中可用）
 */
function getProcessEnv(key: string): string | undefined {
  try {
    return typeof (globalThis as any).process !== "undefined" && (globalThis as any).process.env 
      ? (globalThis as any).process.env[key] 
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 安全地检查是否为开发环境
 */
export function isDev(): boolean {
  try {
    // 检查 import.meta.env
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env.DEV === true || import.meta.env.NODE_ENV === "development";
    }
    
    // 检查 process.env
    const nodeEnv = getProcessEnv("NODE_ENV");
    return nodeEnv === "development";
  } catch {
    // 在 Cloudflare Workers 中，默认为生产环境
    return false;
  }
}

/**
 * 获取环境变量
 * 在 Cloudflare Workers 中，环境变量通过 env 对象传递
 */
export function getEnv(workerEnv?: any) {
  // 在 Cloudflare Workers 中，环境变量通过 env 参数传递
  const rawEnv = workerEnv || {
    APP_URL: getProcessEnv("APP_URL") || "http://localhost:5174",
    NODE_ENV: getProcessEnv("NODE_ENV") || "development",
    VITE_API_URL: getProcessEnv("VITE_API_URL"),
  };

  try {
    return envSchema.parse(rawEnv);
  } catch (error) {
    console.error("❌ 环境变量验证失败:", error);
    console.error("原始环境变量:", rawEnv);
    
    // 在开发环境中提供默认值
    return {
      APP_URL: rawEnv.APP_URL || "http://localhost:5174",
      NODE_ENV: rawEnv.NODE_ENV || "development",
      VITE_API_URL: rawEnv.VITE_API_URL,
    };
  }
}

/**
 * 客户端环境变量
 */
export const clientEnv = {
  VITE_API_URL: typeof window !== "undefined" 
    ? (window as any).__ENV__?.VITE_API_URL || (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
    : getProcessEnv("VITE_API_URL"),
};

/**
 * 类型定义
 */
export type EnvType = z.infer<typeof envSchema>; 