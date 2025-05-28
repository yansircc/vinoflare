import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-16">
      {/* 主标题 */}
      <div className="mb-16 text-center">
        <h1 className="mb-6 font-light text-4xl text-gray-900 md:text-5xl">
          留言板系统
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600 text-lg leading-relaxed">
          基于现代技术栈构建的极简留言板应用
        </p>
      </div>

      {/* 进入按钮 */}
      <div className="mb-20 text-center">
        <Link 
          to="/quotes" 
          className="inline-block rounded-full bg-gray-900 px-8 py-3 font-medium text-white transition-all hover:scale-105 hover:bg-gray-700"
        >
          进入留言板
        </Link>
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

      {/* TanStack Query 特性 */}
      <div className="mt-12 rounded-lg bg-gray-50 p-8">
        <h2 className="mb-6 text-center font-medium text-gray-900 text-xl">
          🚀 TanStack Query 核心特性
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-3 text-2xl">⚡</div>
            <h3 className="mb-2 font-medium text-gray-900">智能缓存</h3>
            <p className="text-gray-600 text-sm">自动缓存管理，减少不必要的网络请求</p>
          </div>
          <div className="text-center">
            <div className="mb-3 text-2xl">🔄</div>
            <h3 className="mb-2 font-medium text-gray-900">后台更新</h3>
            <p className="text-gray-600 text-sm">数据在后台自动更新，保持界面响应</p>
          </div>
          <div className="text-center">
            <div className="mb-3 text-2xl">🎯</div>
            <h3 className="mb-2 font-medium text-gray-900">乐观更新</h3>
            <p className="text-gray-600 text-sm">即时 UI 反馈，提升用户体验</p>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="mt-16 border-gray-200 border-t pt-8 text-center">
        <p className="text-gray-500 text-sm">
          展示现代 React 应用的最佳实践
        </p>
      </div>
    </div>
  )
} 