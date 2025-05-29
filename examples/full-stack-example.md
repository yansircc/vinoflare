# 全栈示例：构建待办事项应用

此示例展示了如何使用 Hono RPC 入门模板构建一个完整的功能。

## 1. 定义数据库模式

```typescript
// src/server/db/schema.ts
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  userId: integer('user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
})
```

## 2. 创建类型

```typescript
// src/server/db/types.ts
export type Todo = typeof todos.$inferSelect
export type TodoCreate = {
  title: string
  completed?: boolean
}
export type TodoUpdate = {
  title?: string
  completed?: boolean
}
```

## 3. 使用程序创建路由器

```typescript
// src/server/routers/todos.ts
import { z } from 'zod'
import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { createDb, todos } from '../db'
import { privateProcedure, privateLoggedProcedure } from '../middleware/procedures'

// 验证模式
const createTodoSchema = z.object({
  title: z.string().min(1, '标题是必需的').max(255),
  completed: z.boolean().optional().default(false),
})

const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
})

export const todosRouter = new Hono()
  // GET /api/todos - 列出用户的待办事项
  .get('/api/todos', ...privateProcedure.query(async (c, ctx) => {
    const db = createDb(c.env)
    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, ctx.user.id))
      .orderBy(todos.createdAt)
    
    return {
      success: true,
      data: userTodos,
      meta: {
        count: userTodos.length,
        userId: ctx.user.id,
        timestamp: new Date(), // 由 superjson 自动序列化！
      }
    }
  }))
  
  // POST /api/todos - 创建新的待办事项
  .post('/api/todos', ...privateLoggedProcedure.mutation<z.infer<typeof createTodoSchema>>(
    async (c, ctx, input) => {
      const db = createDb(c.env)
      const validated = createTodoSchema.parse(input)
      
      const [newTodo] = await db
        .insert(todos)
        .values({
          ...validated,
          userId: ctx.user.id,
        })
        .returning()
      
      return {
        success: true,
        data: newTodo,
        message: `待办事项由 ${ctx.user.name} 创建`,
      }
    }
  ))
  
  // PUT /api/todos/:id - 更新待办事项
  .put('/api/todos/:id', ...privateProcedure.mutation<z.infer<typeof updateTodoSchema>>(
    async (c, ctx, input) => {
      const db = createDb(c.env)
      const id = Number.parseInt(c.req.param('id'), 10)
      
      // 验证所有权
      const [existing] = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, id), eq(todos.userId, ctx.user.id)))
        .limit(1)
      
      if (!existing) {
        return {
          success: false,
          error: '待办事项未找到或访问被拒绝',
        }
      }
      
      const validated = updateTodoSchema.parse(input)
      const [updated] = await db
        .update(todos)
        .set({
          ...validated,
          updatedAt: new Date(),
        })
        .where(eq(todos.id, id))
        .returning()
      
      return {
        success: true,
        data: updated,
      }
    }
  ))
  
  // DELETE /api/todos/:id - 删除待办事项
  .delete('/api/todos/:id', ...privateProcedure.mutation(async (c, ctx) => {
    const db = createDb(c.env)
    const id = Number.parseInt(c.req.param('id'), 10)
    
    // 删除前验证所有权
    const deleted = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, ctx.user.id)))
      .returning()
    
    if (deleted.length === 0) {
      return {
        success: false,
        error: '待办事项未找到或访问被拒绝',
      }
    }
    
    return {
      success: true,
      message: '待办事项删除成功',
      deletedId: id,
    }
  }))
```

## 4. 挂载路由器

```typescript
// src/server/api/index.ts
import { todosRouter } from '../routers/todos'

export const api = new Hono()
  .use('/api/*', cors({
    origin: (origin) => origin,
    credentials: true,
  }))
  .route('/', quotesRouter)
  .route('/', todosRouter) // 添加待办事项路由器
```

## 5. 使用 Hooks 创建 React 组件

```typescript
// src/components/TodoList.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiHelpers } from '../lib/api-client'
import { toast } from 'sonner'

export function TodoList() {
  const queryClient = useQueryClient()
  const [newTodoTitle, setNewTodoTitle] = useState('')

  // 获取待办事项
  const { data: todosData, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const result = await apiHelpers.query(() => api.api.todos.$get())
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })

  // 创建待办事项变更
  const createTodo = useMutation({
    mutationFn: async (title: string) => {
      const result = await apiHelpers.mutate(
        (input) => api.api.todos.$post({ json: input }),
        { title, completed: false }
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success(data.message || '待办事项已创建！')
      setNewTodoTitle('')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // 切换待办事项变更
  const toggleTodo = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const result = await apiHelpers.mutate(
        (input) => api.api.todos[':id'].$put({ 
          param: { id: id.toString() },
          json: input 
        }),
        { completed }
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // 删除待办事项变更
  const deleteTodo = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiHelpers.mutate(
        () => api.api.todos[':id'].$delete({ 
          param: { id: id.toString() } 
        }),
        {}
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('待办事项已删除')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (isLoading) {
    return <div>正在加载待办事项...</div>
  }

  const todos = todosData?.data || []
  const meta = todosData?.meta

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">我的待办事项</h2>
      
      {/* 元信息 */}
      {meta && (
        <div className="text-sm text-gray-600 mb-4">
          总计: {meta.count} | 
          最后更新: {new Date(meta.timestamp).toLocaleTimeString()}
        </div>
      )}
      
      {/* 添加新待办事项 */}
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          if (newTodoTitle.trim()) {
            createTodo.mutate(newTodoTitle)
          }
        }}
        className="mb-6 flex gap-2"
      >
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="添加新待办事项..."
          className="flex-1 rounded-md border px-3 py-2"
          disabled={createTodo.isPending}
        />
        <button
          type="submit"
          disabled={createTodo.isPending || !newTodoTitle.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {createTodo.isPending ? '添加中...' : '添加'}
        </button>
      </form>
      
      {/* 待办事项列表 */}
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-white rounded-md shadow"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo.mutate({ 
                id: todo.id, 
                completed: !todo.completed 
              })}
              className="h-5 w-5"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : 'flex-1'}>
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo.mutate(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              删除
            </button>
          </div>
        ))}
      </div>
      
      {todos.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          还没有待办事项。创建您的第一个吧！
        </p>
      )}
    </div>
  )
}
```

## 6. 添加身份验证流程

```typescript
// src/components/LoginForm.tsx
import { useState } from 'react'
import { apiHelpers } from '../lib/api-client'
import { toast } from 'sonner'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 调用您的认证端点
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error('无效凭据')
      }

      const { token } = await response.json()
      
      // 存储令牌
      apiHelpers.setAuthToken(token)
      
      toast.success('登录成功！')
      onSuccess()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="邮箱"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        required
        className="w-full px-3 py-2 border rounded-md"
      />
      <input
        type="password"
        placeholder="密码"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        required
        className="w-full px-3 py-2 border rounded-md"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

## 演示的关键功能

1. **类型安全的 RPC**: 从服务器到客户端的完全类型推断
2. **Superjson 序列化**: 日期和其他 JS 类型无缝工作
3. **身份验证**: 带中间件的基于令牌的认证
4. **验证**: 使用 Zod 模式进行运行时验证
5. **错误处理**: 一致的错误响应
6. **乐观更新**: 使用 React Query 变更
7. **实时反馈**: Toast 通知
8. **访问控制**: 带所有权验证的用户特定数据

## 优势

- **无需 API 客户端生成**: 类型自然流经系统
- **运行时安全**: 使用 Zod 在边缘进行验证
- **开发者体验**: 到处都有自动完成和类型检查
- **性能**: 使用 Cloudflare Workers 进行边缘部署
- **灵活性**: 易于添加新程序和中间件 