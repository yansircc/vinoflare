import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { QuoteForm } from './components/QuoteForm'
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

app.get('/', async (c) => {
  const db = createDb(c.env)
  const allQuotes = await db.select().from(quotes).orderBy(quotes.createdAt)
  
  return c.render(
    <div>
      <h1>Hello! 欢迎使用留言板系统</h1>
      <QuoteForm />
      
      <div style="max-width: 500px; margin: 40px auto; padding: 20px;">
        <h2>所有留言</h2>
        {allQuotes.length === 0 ? (
          <p>暂无留言</p>
        ) : (
          <div style="display: flex; flex-direction: column; gap: 20px;">
            {allQuotes.map((quote) => (
              <div key={quote.id} style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #f9f9f9;">
                <div style="margin-bottom: 10px;">
                  <strong>{quote.name}</strong> ({quote.email})
                </div>
                <div style="margin-bottom: 10px;">
                  {quote.message}
                </div>
                <div style="font-size: 12px; color: #666;">
                  {quote.createdAt ? new Date(quote.createdAt).toLocaleString('zh-CN') : '未知时间'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
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
      
      // Redirect back to home page after successful submission
      return c.redirect('/')
    } catch (error) {
      // In a real app, you'd want to show the error to the user
      console.error('Error creating quote:', error)
      return c.redirect('/')
    }
  }
)

// Mount the quotes router for API access
const routes = app.route('/api/quotes', quotesRouter)

// Export the app type for RPC client
export type AppType = typeof routes

export default app
