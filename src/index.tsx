/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { renderer } from './renderer'
import { api } from './server/api'
import type { ApiType } from './server/api'

// 创建主应用
const app = new Hono<{ Bindings: Env }>()

// 全局中间件
app.use('*', logger())
app.use(renderer)

// 挂载 API 路由
const routes = app.route('/', api)

// 处理静态资源
app.get('*', async (c) => {
  const url = new URL(c.req.url)
  
  // 静态资源路径
  const isStaticAsset = 
    url.pathname.startsWith('/assets/') || 
      url.pathname.startsWith('/chunks/') || 
      url.pathname.startsWith('/static/') ||
    url.pathname === '/favicon.ico'
  
  if (isStaticAsset) {
    try {
      return await c.env.ASSETS.fetch(c.req.raw)
    } catch (error) {
      console.error('获取资源时出错:', error)
      // 转到 SPA 处理器
    }
  }
  
  // 对于所有其他路由，返回 SPA HTML（未压缩）
  return c.render(
    <div id="root">
      {/* React 应用将在此处挂载 */}
    </div>
  )
})

// 为客户端导出类型
export type AppType = typeof routes
export type { ApiType }

export default app
