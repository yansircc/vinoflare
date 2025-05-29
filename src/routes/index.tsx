import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-20">
      
      <div className="space-y-6">
        {/* 主标题 */}
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">
            Hono 全栈开发模板
          </h1>
          <p className="text-gray-600 text-xl">
            使用 superjson 序列化的类型安全 RPC
          </p>
        </div>

        {/* 进入按钮 */}
        <div className="text-center">
          <Link 
            to="/quotes" 
            className="inline-block rounded-full bg-gray-900 px-8 py-3 font-medium text-white transition-all hover:scale-105 hover:bg-gray-700"
          >
            进入留言板
          </Link>
        </div>
      </div>

      {/* 技术栈展示 */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* 前端技术 */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 font-medium text-gray-900 text-xl">前端技术</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-gray-700">TanStack Query - 强大的数据获取和状态管理</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-700">TanStack Router - 类型安全的路由系统</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-gray-700">Tanstack Form - 现代表单库</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <span className="text-gray-700">Tailwind CSS - 原子化 CSS 框架</span>
            </div>
          </div>
        </div>

        {/* 后端技术 */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 font-medium text-gray-900 text-xl">后端技术</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-gray-700">Hono - 轻量级 Web 框架</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-gray-700">Drizzle ORM - 现代 TypeScript ORM</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-gray-700">Cloudflare D1 - 边缘数据库</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-gray-700">Vite - 快速构建工具</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
} 