import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * 客户端环境变量配置
 * 只包含客户端可以安全访问的变量
 */
export const clientEnv = createEnv({
  /**
   * 客户端环境变量
   * 这些变量在客户端和服务器端都可用
   */
  clientPrefix: "VITE_",
  
  client: {
    // 客户端可访问的 API URL
    VITE_API_URL: z.string().url().optional(),
  },

  /**
   * 运行时环境变量映射
   */
  runtimeEnv: {
    VITE_API_URL: import.meta.env?.VITE_API_URL || process.env.VITE_API_URL,
  },

  /**
   * 将空字符串视为 undefined
   */
  emptyStringAsUndefined: true,

  /**
   * 客户端上下文检测
   */
  isServer: false,

  /**
   * 自定义错误处理
   */
  onValidationError: (error) => {
    console.error("❌ 客户端环境变量验证失败:", error);
    throw new Error("客户端环境变量配置错误");
  },
}); 