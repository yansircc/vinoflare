import { Link, Outlet } from '@tanstack/react-router'
import { useSession } from '../lib/api-client'

export function Layout() {
  const { data: session, isPending } = useSession();

  return (
    <div className="flex h-screen flex-col space-y-20 bg-white">
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
              
              {/* 认证相关导航 */}
              {isPending ? (
                <div className="text-gray-500 text-sm">加载中...</div>
              ) : session?.user ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">
                    欢迎, {session.user.name}
                  </span>
                  <Link 
                    to="/profile"
                    className="font-medium text-gray-600 transition-colors hover:text-gray-900"
                  >
                    个人资料
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link 
                    to="/login"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700"
                  >
                    Discord 登录
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="border-gray-200 border-t bg-gray-50">
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
    </div>
  );
}