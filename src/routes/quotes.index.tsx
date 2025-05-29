import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { QuoteForm } from '../components/QuoteForm'
import { useDeleteQuote, useQuotes } from '../lib/quotes-api'
import type { QuoteSlect } from '../server/db/types'
  
export const Route = createFileRoute('/quotes/')({
  component: QuotesList,
})

function QuotesList() {
  const [showForm, setShowForm] = useState(false)
  const [editingQuote, setEditingQuote] = useState<QuoteSlect | null>(null)

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

  const handleEditQuote = (quote: QuoteSlect) => {
    setEditingQuote(quote)
    setShowForm(false) // 关闭新建表单
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingQuote(null)
  }

  const handleCancelEdit = () => {
    setEditingQuote(null)
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
    <div className="mx-auto max-w-4xl">
      {/* 头部 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-light text-2xl text-gray-900">留言板</h1>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm)
            setEditingQuote(null) // 关闭编辑表单
          }}
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

      {/* 编辑留言表单 */}
      {editingQuote && (
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="font-medium text-gray-900 text-lg">编辑留言</h2>
          </div>
          <QuoteForm 
            initialData={editingQuote}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelEdit}
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
          {quotes.map((quote: QuoteSlect) => (
            <div 
              key={quote.id} 
              className="group border-gray-100 border-b pb-6 last:border-b-0"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <Link 
                    to="/quotes/$id" 
                    params={{ id: quote.id.toString() }}
                    className="cursor-pointer font-medium text-gray-900 transition-colors hover:text-blue-600"
                  >
                    {quote.name}
                  </Link>
                  <p className="text-gray-500 text-sm">
                    {quote.email}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link 
                    to="/quotes/$id" 
                    params={{ id: quote.id.toString() }}
                    className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-blue-600 group-hover:opacity-100"
                  >
                    查看
                  </Link>
                  <button 
                    type="button"
                    className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-blue-600 group-hover:opacity-100"
                    onClick={() => handleEditQuote(quote)}
                  >
                    编辑
                  </button>
                  <button 
                    type="button"
                    className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
                    onClick={() => handleDeleteQuote(quote.id)}
                    disabled={deleteQuoteMutation.isPending}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-gray-800 leading-relaxed">
                  {quote.message.length > 150 
                    ? `${quote.message.slice(0, 150)}...` 
                    : quote.message
                  }
                </p>
                {quote.message.length > 150 && (
                  <Link 
                    to="/quotes/$id" 
                    params={{ id: quote.id.toString() }}
                    className="mt-1 text-blue-600 text-sm transition-colors hover:text-blue-800"
                  >
                    查看完整内容 →
                  </Link>
                )}
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