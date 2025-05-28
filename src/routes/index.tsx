import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="mb-5 font-bold text-3xl text-gray-800">欢迎使用留言板系统</h1>
      <p className="mb-8 text-gray-600 text-lg">
        这是一个基于 Hono + TanStack Router + Drizzle ORM + Cloudflare D1 构建的现代留言板应用
      </p>
      
      <div className="mb-10 flex flex-wrap justify-center gap-4">
        <Link 
          to="/quotes" 
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white no-underline transition-colors hover:bg-blue-700"
        >
          进入留言板
        </Link>
      </div>

      <div className="rounded-lg bg-gray-50 p-8 text-left">
        <h2 className="mb-5 font-semibold text-gray-800 text-xl">技术栈</h2>
        <ul className="list-none space-y-3 p-0">
          <li className="rounded border border-gray-200 bg-white p-2">
            🚀 <strong>Hono</strong> - 轻量级、快速的 Web 框架
          </li>
          <li className="rounded border border-gray-200 bg-white p-2">
            🧭 <strong>TanStack Router</strong> - 类型安全的文件路由系统
          </li>
          <li className="rounded border border-gray-200 bg-white p-2">
            🗄️ <strong>Drizzle ORM</strong> - 现代 TypeScript ORM
          </li>
          <li className="rounded border border-gray-200 bg-white p-2">
            ☁️ <strong>Cloudflare D1</strong> - 边缘数据库
          </li>
          <li className="rounded border border-gray-200 bg-white p-2">
            ⚡ <strong>Vite</strong> - 快速构建工具
          </li>
          <li className="rounded border border-gray-200 bg-white p-2">
            🔗 <strong>Hono RPC</strong> - 类型安全的远程过程调用
          </li>
        </ul>
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5 text-left">
        <h3 className="mt-0 font-semibold text-blue-700 text-lg">🚀 Hono RPC 特性</h3>
        <ul className="space-y-1 text-gray-800 leading-relaxed">
          <li><strong>类型安全</strong>：客户端和服务端共享类型定义，编译时检查错误</li>
          <li><strong>自动补全</strong>：IDE 提供完整的 API 方法和参数提示</li>
          <li><strong>运行时验证</strong>：使用 Zod 进行请求和响应验证</li>
          <li><strong>错误处理</strong>：统一的错误处理和状态码管理</li>
          <li><strong>性能优化</strong>：避免手动构建 URL 和处理序列化</li>
        </ul>
      </div>
    </div>
  )
} 