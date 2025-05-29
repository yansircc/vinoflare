import { zValidator } from '@hono/zod-validator'
import { desc } from 'drizzle-orm'
import { Hono } from 'hono'
import { createDb, schema, types   } from '../db' 
import { authMiddleware, loggingMiddleware } from '../middleware/procedures'

// 按照 Hono RPC 模式创建文章路由器
const app = new Hono<{ 
  Bindings: Env
  Variables: {
    user: types.User
  }
}>()
  // POST /api/posts - 创建新文章（需要认证）
  .post('/api/posts',
    authMiddleware,
    zValidator('json', types.postCreateSchema),
    loggingMiddleware,
    async (c) => {
      const db = createDb(c.env)
      const user = c.get('user')
      const validatedInput = c.req.valid('json')
      
      const [newPost] = await db
        .insert(schema.posts)
        .values({
          title: validatedInput.title,
          content: validatedInput.content,
        })
        .returning()
      
      return c.json({
        success: true,
        data: newPost,
        message: `文章由 ${user.name} 成功创建`,
      }, 201)
    }
  )

  // GET /api/posts/latest
  .get('/api/posts/latest', loggingMiddleware, async (c) => {
    const db = createDb(c.env)
    const latestPost = await db
      .select()
      .from(schema.posts)
      .orderBy(desc(schema.posts.createdAt))
      .limit(1)

    return c.json({
      success: true,
      data: latestPost,
    })
  })
  
export const postsRouter = app
export type PostsRouterType = typeof app 