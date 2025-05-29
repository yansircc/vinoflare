import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { User } from '../db/types'

// 认证中间件 - 验证 JWT 或会话
export const authMiddleware = createMiddleware<{
  Variables: {
    user: User
  }
}>(async (c, next) => {
  // 在真实应用中，您将在这里验证 JWT
  const authHeader = c.req.header('Authorization')
  
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   throw new HTTPException(401, {
  //     message: '未授权 - 缺少或无效的令牌',
  //   })
  // }

  // 演示用的模拟用户 - 替换为真实的 JWT 验证
  const mockUser: User = {
    id: 1,
    name: '演示用户',
    email: 'demo@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  c.set('user', mockUser)
  await next()
})

// 日志中间件
export const loggingMiddleware = createMiddleware(async (c, next) => {
  const start = performance.now()
  
  await next()
  
  const duration = performance.now() - start
  console.log(`[${c.req.method}] ${c.req.path} - ${duration.toFixed(2)}ms`)
}) 