import { createAuthClient } from "better-auth/react";

// 创建 Better Auth 客户端
const authClient = createAuthClient();

// 导出认证方法
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
