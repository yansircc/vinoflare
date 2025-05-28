/** @jsxImportSource hono/jsx */
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
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
      
      // Redirect back to home page after successful submission
      return c.redirect('/')
    } catch (error) {
      // In a real app, you'd want to show the error to the user
      console.error('Error creating quote:', error)
      return c.redirect('/')
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
