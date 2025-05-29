import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { createDb, quotes } from '../db'
import type { User } from '../db/types'
import { quoteCreateSchema, quoteIdSchema, quoteUpdateSchema } from '../db/types'
import { authMiddleware, loggingMiddleware } from '../middleware/procedures'

// 按照 Hono RPC 模式创建留言路由器
const app = new Hono<{ 
  Bindings: Env
  Variables: {
    user: User
  }
}>()
  // GET /api/quotes - 列出所有留言（公开）
  .get('/api/quotes', loggingMiddleware, async (c) => {
    const db = createDb(c.env)
    const allQuotes = await db
      .select()
      .from(quotes)
      .orderBy(quotes.createdAt)
    
    return c.json({
      success: true,
      data: allQuotes,
      count: allQuotes.length,
    })
  })
  
  // GET /api/quotes/:id - 获取单条留言（公开）
  .get('/api/quotes/:id', 
    zValidator('param', quoteIdSchema),
    loggingMiddleware,
    async (c) => {
      const db = createDb(c.env)
      const { id } = c.req.valid('param')
      
      const [quote] = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, id))
        .limit(1)
      
      if (!quote) {
        throw new HTTPException(404, { message: '留言未找到' })
      }
      
      return c.json({
        success: true,
        data: quote,
      })
    }
  )
  
  // POST /api/quotes - 创建新留言（需要认证）
  .post('/api/quotes',
    authMiddleware,
    zValidator('json', quoteCreateSchema),
    loggingMiddleware,
    async (c) => {
      const db = createDb(c.env)
      const user = c.get('user')
      const validatedInput = c.req.valid('json')
      
      const [newQuote] = await db
        .insert(quotes)
        .values({
          name: validatedInput.name,
          email: validatedInput.email,
          message: validatedInput.message,
        })
        .returning()
      
      return c.json({
        success: true,
        data: newQuote,
        message: `留言由 ${user.name} 成功创建`,
      }, 201)
    }
  )
  
  // PUT /api/quotes/:id - 更新留言（需要认证）
  .put('/api/quotes/:id',
    authMiddleware,
    zValidator('param', quoteIdSchema),
    zValidator('json', quoteUpdateSchema),
    async (c) => {
      const db = createDb(c.env)
      const user = c.get('user')
      const { id } = c.req.valid('param')
      const updateData = c.req.valid('json')
      
      // 检查留言是否存在
      const [existingQuote] = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, id))
        .limit(1)
      
      if (!existingQuote) {
        throw new HTTPException(404, { message: '留言未找到' })
      }
      
      // 过滤掉未定义的值
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )
      
      if (Object.keys(filteredUpdateData).length === 0) {
        throw new HTTPException(400, { message: '没有需要更新的字段' })
      }
      
      const [updatedQuote] = await db
        .update(quotes)
        .set(filteredUpdateData)
        .where(eq(quotes.id, id))
        .returning()
      
      return c.json({
        success: true,
        data: updatedQuote,
        message: `留言由 ${user.name} 更新`,
      })
    }
  )
  
  // DELETE /api/quotes/:id - 删除留言（需要认证）
  .delete('/api/quotes/:id',
    authMiddleware,
    zValidator('param', quoteIdSchema),
    async (c) => {
      const db = createDb(c.env)
      const user = c.get('user')
      const { id } = c.req.valid('param')
      
      // 检查留言是否存在
      const [existingQuote] = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, id))
        .limit(1)
      
      if (!existingQuote) {
        throw new HTTPException(404, { message: '留言未找到' })
      }
      
      await db.delete(quotes).where(eq(quotes.id, id))
      
      return c.json({
        success: true,
        message: `留言由 ${user.name} 删除`,
        deletedId: id,
      })
    }
  )
  
  // GET /api/quotes/stats - 获取留言统计（公开）
  .get('/api/quotes/stats', loggingMiddleware, async (c) => {
    const db = createDb(c.env)
    const allQuotes = await db.select().from(quotes)
    
    const stats = {
      total: allQuotes.length,
      lastDay: allQuotes.filter(q => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return q.createdAt && new Date(q.createdAt) > oneDayAgo
      }).length,
      uniqueEmails: new Set(allQuotes.map(q => q.email)).size,
    }
    
    return c.json({
      success: true,
      data: stats,
    })
  })

export const quotesRouter = app
export type QuotesRouterType = typeof app 