/** @jsxImportSource hono/jsx */
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { env } from './lib/env'
import { renderer } from './renderer'
import type { Env } from './server/db'
import { createDb, quotes } from './server/db'
import { quotesRouter } from './server/routers/quote-router'

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('请输入有效的邮箱地址'),
  message: z.string().min(1, '留言不能为空'),
})

// Mount the quotes router for API access FIRST
const routes = app.route('/api/quotes', quotesRouter)

// 添加环境信息端点，用于调试
app.get('/api/env', (c) => {
  return c.json({
    app_url: env.APP_URL,
    node_env: env.NODE_ENV,
    // 不要暴露敏感信息，这里只是为了演示
    timestamp: new Date().toISOString(),
  })
})

// Handle form submission
app.post('/submit-quote', 
  zValidator('form', formSchema),
  async (c) => {
    const db = createDb(c.env)
    const validatedData = c.req.valid('form')
    
    try {
      await db.insert(quotes).values({
        name: validatedData.name,
        email: validatedData.email,
        message: validatedData.message,
      })
      
      // 使用环境变量中的 APP_URL 进行重定向
      return c.redirect(env.APP_URL)
    } catch (error) {
      // In a real app, you'd want to show the error to the user
      console.error('Error creating quote:', error)
      return c.redirect(env.APP_URL)
    }
  }
)

// Serve the TanStack Router app for all OTHER routes (this must be LAST)
app.get('*', async (c) => {
  return c.render(
    <div id="root">
      {/* TanStack Router will be mounted here on the client side */}
    </div>
  )
})

// Export the app type for RPC client
export type AppType = typeof routes

export default app
