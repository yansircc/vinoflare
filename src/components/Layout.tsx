import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { isDev } from '../lib/env'

export function Layout() {
  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <header className="border-gray-200 border-b bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="flex items-center justify-between py-4">
            {/* Logo/标题 */}
            <Link 
              to="/" 
              className="font-medium text-gray-900 text-xl transition-colors hover:text-gray-700"
            >
              留言板系统
            </Link>
            
            {/* 导航链接 */}
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className="font-medium text-gray-600 transition-colors hover:text-gray-900"
                activeProps={{ 
                  className: "font-medium text-gray-900 border-b-[3px] border-gray-900 pb-1" 
                }}
              >
                首页
              </Link>
              <Link 
                to="/quotes" 
                className="font-medium text-gray-600 transition-colors hover:text-gray-900"
                activeProps={{ 
                  className: "font-medium text-gray-900 border-b-[3px] border-gray-900 pb-1" 
                }}
              >
                留言列表
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="mx-auto max-w-4xl px-4">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="mt-20 border-gray-200 border-t bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              基于 Hono + TanStack + Cloudflare 构建
            </p>
            <p className="mt-1 text-gray-400 text-xs">
              展示现代全栈应用的最佳实践
            </p>
          </div>
        </div>
      </footer>

      {/* 开发工具 */}
      {isDev() && <TanStackRouterDevtools />}
    </div>
  )
} 