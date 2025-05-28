import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /**
   * 服务器端环境变量
   * 这些变量只在服务器端可用，客户端无法访问
   */
  server: {
    // 应用 URL - 本地开发和生产环境不同
    APP_URL: z.string().url().default("http://localhost:5174"),
    
    // 数据库相关（如果需要的话）
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },

  /**
   * 客户端环境变量
   * 这些变量在客户端和服务器端都可用
   * 必须以指定的前缀开头
   */
  clientPrefix: "VITE_",
  
  client: {
    // 客户端可访问的 API URL
    VITE_API_URL: z.string().url().optional(),
  },

  /**
   * 运行时环境变量映射
   * 这里需要明确指定每个环境变量的来源
   */
  runtimeEnv: {
    // 服务器端变量
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    
    // 客户端变量
    VITE_API_URL: process.env.VITE_API_URL,
  },

  /**
   * 将空字符串视为 undefined
   * 这有助于处理 .env 文件中的空值
   */
  emptyStringAsUndefined: true,

  /**
   * 服务器上下文检测
   * 在 Cloudflare Workers 中，window 是 undefined
   */
  isServer: typeof window === "undefined",

  /**
   * 自定义错误处理
   */
  onValidationError: (error) => {
    console.error("❌ 环境变量验证失败:", error);
    throw new Error("环境变量配置错误");
  },

  onInvalidAccess: (variable) => {
    console.error(`❌ 尝试在客户端访问服务器端变量: ${variable}`);
    throw new Error(`无法在客户端访问服务器端环境变量: ${variable}`);
  },
}); 