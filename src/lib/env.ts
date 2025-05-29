import { z } from "zod";

/**
 * 简化的环境变量管理
 * 直接从运行时环境读取，避免构建时固化
 */

// 环境变量验证 schema
const envSchema = z.object({
  APP_URL: z.string().url('APP_URL必须是有效的URL'),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID不能为空'),
  DISCORD_CLIENT_SECRET: z.string().min(1, 'DISCORD_CLIENT_SECRET不能为空'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET至少需要32个字符').optional(),
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
 * 生成安全的随机字符串用于 Better Auth Secret
 */
function generateSecretKey(): string {
  // 在 Cloudflare Workers 中使用 crypto.getRandomValues
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 获取环境变量
 * 在 Cloudflare Workers 中，环境变量通过 env 对象传递
 */
export function getEnv(workerEnv?: any) {
  // 在 Cloudflare Workers 中，环境变量通过 env 参数传递
  const rawEnv = workerEnv || {
    APP_URL: getProcessEnv("APP_URL") || "http://localhost:5173",
    NODE_ENV: getProcessEnv("NODE_ENV") || "development",
    DISCORD_CLIENT_ID: getProcessEnv("DISCORD_CLIENT_ID") || "",
    DISCORD_CLIENT_SECRET: getProcessEnv("DISCORD_CLIENT_SECRET") || "",
    BETTER_AUTH_SECRET: getProcessEnv("BETTER_AUTH_SECRET") || generateSecretKey(),
  };

  try {
    const validatedEnv = envSchema.parse(rawEnv);
    
    // 确保有有效的密钥
    const authSecret = validatedEnv.BETTER_AUTH_SECRET || generateSecretKey();
    
    // 设置默认的 Better Auth 配置
    const finalEnv = {
      ...validatedEnv,
      BETTER_AUTH_SECRET: authSecret,
    };
    
    // 验证密钥长度
    if (finalEnv.BETTER_AUTH_SECRET.length < 32) {
      console.warn("⚠️ BETTER_AUTH_SECRET 长度不足，正在生成新的密钥");
      finalEnv.BETTER_AUTH_SECRET = generateSecretKey();
    }
    
    return finalEnv;
  } catch (error) {
    console.error("❌ 环境变量验证失败:", error);
    
    // 在开发环境中提供默认值并警告
    if (rawEnv.NODE_ENV === "development") {
      console.warn("⚠️ 使用开发环境默认配置。请在生产环境中设置正确的环境变量。");
      
      const devSecret = generateSecretKey();
      console.log("🔐 开发环境生成的密钥:", devSecret);
      
      return {
        APP_URL: rawEnv.APP_URL || "http://localhost:5173",
        NODE_ENV: rawEnv.NODE_ENV || "development",
        DISCORD_CLIENT_ID: rawEnv.DISCORD_CLIENT_ID || "dev-discord-client-id",
        DISCORD_CLIENT_SECRET: rawEnv.DISCORD_CLIENT_SECRET || "dev-discord-client-secret",
        BETTER_AUTH_SECRET: devSecret,
      };
    }
    
    // 生产环境抛出错误
    throw new Error("生产环境必须设置正确的环境变量");
  }
}

/**
 * 客户端环境变量（仅包含公开信息）
 */
export const clientEnv = {
  APP_URL: typeof window !== "undefined" 
    ? (window as any).__ENV__?.APP_URL || (typeof import.meta !== "undefined" && import.meta.env?.APP_URL)
    : getProcessEnv("APP_URL"),
  NODE_ENV: typeof window !== "undefined"
    ? (window as any).__ENV__?.NODE_ENV || (typeof import.meta !== "undefined" && import.meta.env?.NODE_ENV)
    : getProcessEnv("NODE_ENV"),
};

/**
 * 验证 Better Auth 配置
 */
export function validateAuthConfig(env: ReturnType<typeof getEnv>) {
  const errors: string[] = [];
  
  if (!env.DISCORD_CLIENT_ID || env.DISCORD_CLIENT_ID === "dev-discord-client-id") {
    errors.push("DISCORD_CLIENT_ID 未正确配置");
  }
  
  if (!env.DISCORD_CLIENT_SECRET || env.DISCORD_CLIENT_SECRET === "dev-discord-client-secret") {
    errors.push("DISCORD_CLIENT_SECRET 未正确配置");
  }
  
  if (env.NODE_ENV === "production" && (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32)) {
    errors.push("生产环境需要设置安全的 BETTER_AUTH_SECRET（至少32字符）");
  }
  
  if (errors.length > 0) {
    console.warn("⚠️ Auth 配置警告:", errors);
    
    if (env.NODE_ENV === "production") {
      throw new Error(`Auth 配置错误: ${errors.join(", ")}`);
    }
  }
  
  return true;
}
