import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { QuoteForm } from '../components/QuoteForm'
import { type ApiQuote, useDeleteQuote, useQuotes } from '../lib/quotes-api'

export const Route = createFileRoute('/quotes/')({
  component: QuotesList,
})

function QuotesList() {
  const [showForm, setShowForm] = useState(false)

  // 使用 TanStack Query hooks
  const { data: quotes = [], isLoading, isError, error } = useQuotes()
  const deleteQuoteMutation = useDeleteQuote()

  const handleDeleteQuote = async (id: number) => {
    if (!confirm('确定要删除这条留言吗？')) return

    try {
      await deleteQuoteMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting quote:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">
          加载失败: {error?.message || '未知错误'}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      {/* 头部 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-light text-2xl text-gray-900">留言板</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
        >
          {showForm ? '取消' : '写留言'}
        </button>
      </div>

      {/* 创建留言表单 */}
      {showForm && (
        <div className="mb-8">
          <QuoteForm 
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* 留言列表 */}
      {quotes.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-gray-400 text-lg">暂无留言</div>
          <p className="mt-2 text-gray-500 text-sm">成为第一个留言的人吧</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700"
          >
            写留言
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote: ApiQuote) => (
            <div 
              key={quote.id} 
              className="group border-gray-100 border-b pb-6 last:border-b-0"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {quote.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {quote.email}
                  </p>
                </div>
                <button 
                  type="button"
                  className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
                  onClick={() => handleDeleteQuote(quote.id)}
                  disabled={deleteQuoteMutation.isPending}
                >
                  删除
                </button>
              </div>
              <div className="mb-3">
                <p className="text-gray-800 leading-relaxed">
                  {quote.message}
                </p>
              </div>
              <div className="text-gray-400 text-xs">
                {quote.createdAt ? new Date(quote.createdAt).toLocaleString('zh-CN') : '未知时间'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 返回首页 */}
      <div className="mt-12 text-center">
        <Link 
          to="/"
          className="text-gray-500 text-sm transition-colors hover:text-gray-900"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  )
} 