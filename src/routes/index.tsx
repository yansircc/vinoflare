import { createFileRoute } from '@tanstack/react-router'
import { QuoteList } from '../components/QuoteList'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">
            Hono 全栈开发模板
          </h1>
          <p className="text-gray-600 text-xl">
            使用 superjson 序列化的类型安全 RPC
          </p>
        </div>
        
        <QuoteList />
      </div>
    </div>
  )
} 