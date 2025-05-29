import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { quotesRouter } from '../routers/quotes'

// 按照 Hono RPC 模式创建主 API 应用
const app = new Hono()
  // 为所有 API 路由应用 CORS
  .use('/api/*', cors({
    origin: (origin) => origin, // 在开发中允许所有源，在生产中限制
    credentials: true,
  }))
  // 挂载路由器 - 重要：使用 .route() 以确保正确的类型推断
  .route('/', quotesRouter)

// 导出 API 及其类型以供 RPC 使用
export const api = app
export type ApiType = typeof app 