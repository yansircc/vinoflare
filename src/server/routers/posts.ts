import { zValidator } from '@hono/zod-validator'
import { asc, count, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { createDb, schema, types } from '../db'
import { authMiddleware, loggingMiddleware, optionalAuthMiddleware } from '../middleware/procedures'
import type { AuthContext } from '../types/context'

// 按照 Hono RPC 模式创建文章路由器
const app = new Hono<AuthContext>()

app
  // POST /posts - 创建新文章（需要认证）
  .post('/posts',
    authMiddleware,
    zValidator('json', types.postCreateSchema),
    loggingMiddleware,
    async (c) => {
      try {
        const db = createDb(c.env.DB)
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
          message: `文章《${newPost.title}》由 ${user?.name} 成功创建`,
        }, 201)
      } catch (error) {
        console.error('创建文章失败:', error)
        return c.json({
          success: false,
          error: '创建文章失败',
          timestamp: new Date().toISOString()
        }, 500)
      }
    }
  )

  // GET /posts - 获取文章列表（支持分页和排序）
  .get('/posts',
    optionalAuthMiddleware,
    zValidator('query', types.querySchema),
    loggingMiddleware,
    async (c) => {
      try {
        const db = createDb(c.env.DB)
        const { page, limit, sort } = c.req.valid('query')
        const offset = (page - 1) * limit
        
        // 获取总数
        const [{ totalCount }] = await db
          .select({ totalCount: count() })
          .from(schema.posts)
        
        // 获取文章列表
        const posts = await db
          .select()
          .from(schema.posts)
          .orderBy(sort === 'newest' ? desc(schema.posts.createdAt) : asc(schema.posts.createdAt))
          .limit(limit)
          .offset(offset)

        const totalPages = Math.ceil(totalCount / limit)

        return c.json({
          success: true,
          data: posts,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          meta: {
            sort,
            requestedBy: c.get('user')?.name || 'anonymous',
          }
        })
      } catch (error) {
        console.error('获取文章列表失败:', error)
        return c.json({
          success: false,
          error: '获取文章列表失败',
          timestamp: new Date().toISOString()
        }, 500)
      }
    }
  )

  // GET /posts/latest - 获取最新文章
  .get('/posts/latest', 
    optionalAuthMiddleware,
    loggingMiddleware, 
    async (c) => {
      try {
        const db = createDb(c.env.DB)
        const latestPost = await db
          .select()
          .from(schema.posts)
          .orderBy(desc(schema.posts.createdAt))
          .limit(1)

        return c.json({
          success: true,
          data: latestPost[0] || null,
          message: latestPost[0] ? '最新文章获取成功' : '暂无文章'
        })
      } catch (error) {
        console.error('获取最新文章失败:', error)
        return c.json({
          success: false,
          error: '获取最新文章失败',
          timestamp: new Date().toISOString()
        }, 500)
      }
    }
  )

  // GET /posts/:id - 获取特定文章
  .get('/posts/:id',
    optionalAuthMiddleware,
    loggingMiddleware,
    async (c) => {
      try {
        const db = createDb(c.env.DB)
        const id = Number.parseInt(c.req.param('id'))
        
        if (Number.isNaN(id)) {
          return c.json({
            success: false,
            error: '无效的文章ID'
          }, 400)
        }

        const [post] = await db
          .select()
          .from(schema.posts)
          .where(eq(schema.posts.id, id))

        if (!post) {
          return c.json({
            success: false,
            error: '文章不存在'
          }, 404)
        }

        return c.json({
          success: true,
          data: post
        })
      } catch (error) {
        console.error('获取文章失败:', error)
        return c.json({
          success: false,
          error: '获取文章失败',
          timestamp: new Date().toISOString()
        }, 500)
      }
    }
  )

  // PUT /posts/:id - 更新文章（需要认证）
  .put('/posts/:id',
    authMiddleware,
    zValidator('json', types.postUpdateSchema),
    loggingMiddleware,
    async (c) => {
      try {
        const db = createDb(c.env.DB)
        const user = c.get('user')
        const id = Number.parseInt(c.req.param('id'))
        const validatedInput = c.req.valid('json')
        
        if (Number.isNaN(id)) {
          return c.json({
            success: false,
            error: '无效的文章ID'
          }, 400)
        }

        // 检查文章是否存在
        const [existingPost] = await db
          .select()
          .from(schema.posts)
          .where(eq(schema.posts.id, id))

        if (!existingPost) {
          return c.json({
            success: false,
            error: '文章不存在'
          }, 404)
        }

        // 更新文章
        const [updatedPost] = await db
          .update(schema.posts)
          .set({
            ...validatedInput,
            // 注意：这里可能需要添加 updatedAt 字段到 schema
          })
          .where(eq(schema.posts.id, id))
          .returning()

        return c.json({
          success: true,
          data: updatedPost,
          message: `文章《${updatedPost.title}》由 ${user?.name} 成功更新`
        })
      } catch (error) {
        console.error('更新文章失败:', error)
        return c.json({
          success: false,
          error: '更新文章失败',
          timestamp: new Date().toISOString()
        }, 500)
      }
    }
  )

  // DELETE /posts/:id - 删除文章（需要认证）
  .delete('/posts/:id',
    authMiddleware,
    loggingMiddleware,
    async (c) => {
      try {
        const db = createDb(c.env.DB)
        const user = c.get('user')
        const id = Number.parseInt(c.req.param('id'))
        
        if (Number.isNaN(id)) {
          return c.json({
            success: false,
            error: '无效的文章ID'
          }, 400)
        }

        // 检查文章是否存在
        const [existingPost] = await db
          .select()
          .from(schema.posts)
          .where(eq(schema.posts.id, id))

        if (!existingPost) {
          return c.json({
            success: false,
            error: '文章不存在'
          }, 404)
        }

        // 删除文章
        await db
          .delete(schema.posts)
          .where(eq(schema.posts.id, id))

        return c.json({
          success: true,
          message: `文章《${existingPost.title}》由 ${user?.name} 成功删除`
        })
      } catch (error) {
        console.error('删除文章失败:', error)
        return c.json({
          success: false,
          error: '删除文章失败',
          timestamp: new Date().toISOString()
        }, 500)
      }
    }
  )
  
export const postsRouter = app
export type PostsRouterType = typeof app 