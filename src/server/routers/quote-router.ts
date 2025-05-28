import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { createDb, quotes } from '../db'
import { quoteCreateSchema, quoteUpdateSchema } from '../db/types'

const paramsSchema = z.object({
  id: z.string().transform((val) => Number.parseInt(val, 10)),
})

// Create the quotes router
export const quotesRouter = new Hono<{ Bindings: CloudflareBindings }>()
  // GET /quotes - 获取所有留言
  .get('/', async (c) => {
    const db = createDb(c.env)
    const allQuotes = await db.select().from(quotes).orderBy(quotes.createdAt)
    
    return c.json({
      success: true,
      data: allQuotes,
    })
  })
  
  // POST /quotes - 创建新留言 (JSON API)
  .post('/', 
    zValidator('json', quoteCreateSchema),
    async (c) => {
      const db = createDb(c.env)
      const validatedData = c.req.valid('json')
      
      try {
        const newQuote = await db.insert(quotes).values({
          name: validatedData.name,
          email: validatedData.email,
          message: validatedData.message,
        }).returning()
        
        return c.json({
          success: true,
          message: '留言创建成功',
          data: newQuote[0],
        }, 201)
      } catch (error) {
        return c.json({
          success: false,
          message: '创建留言失败',
          error: error instanceof Error ? error.message : '未知错误',
        }, 500)
      }
    }
  )
  
  // GET /quotes/:id - 获取单个留言
  .get('/:id',
    zValidator('param', paramsSchema),
    async (c) => {
      const db = createDb(c.env)
      const { id } = c.req.valid('param')
      
      try {
        const quote = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1)
        
        if (quote.length === 0) {
          return c.json({
            success: false,
            message: '留言不存在',
          }, 404)
        }
        
        return c.json({
          success: true,
          data: quote[0],
        })
      } catch (error) {
        return c.json({
          success: false,
          message: '获取留言失败',
          error: error instanceof Error ? error.message : '未知错误',
        }, 500)
      }
    }
  )
  
  // PUT /quotes/:id - 更新留言
  .put('/:id',
    zValidator('param', paramsSchema),
    zValidator('json', quoteUpdateSchema),
    async (c) => {
      const db = createDb(c.env)
      const { id } = c.req.valid('param')
      const validatedData = c.req.valid('json')
      
      try {
        // 检查留言是否存在
        const existingQuote = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1)
        
        if (existingQuote.length === 0) {
          return c.json({
            success: false,
            message: '留言不存在',
          }, 404)
        }
        
        // 更新留言
        const updatedQuote = await db
          .update(quotes)
          .set(validatedData)
          .where(eq(quotes.id, id))
          .returning()
        
        return c.json({
          success: true,
          message: '留言更新成功',
          data: updatedQuote[0],
        })
      } catch (error) {
        return c.json({
          success: false,
          message: '更新留言失败',
          error: error instanceof Error ? error.message : '未知错误',
        }, 500)
      }
    }
  )
  
  // DELETE /quotes/:id - 删除留言
  .delete('/:id',
    zValidator('param', paramsSchema),
    async (c) => {
      const db = createDb(c.env)
      const { id } = c.req.valid('param')
      
      try {
        // 检查留言是否存在
        const existingQuote = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1)
        
        if (existingQuote.length === 0) {
          return c.json({
            success: false,
            message: '留言不存在',
          }, 404)
        }
        
        // 删除留言
        await db.delete(quotes).where(eq(quotes.id, id))
        
        return c.json({
          success: true,
          message: '留言删除成功',
        })
      } catch (error) {
        return c.json({
          success: false,
          message: '删除留言失败',
          error: error instanceof Error ? error.message : '未知错误',
        }, 500)
      }
    }
  )

// Export the router type for RPC client
export type QuotesRouterType = typeof quotesRouter
