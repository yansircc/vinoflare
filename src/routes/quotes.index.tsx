import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { type ApiQuote, quotesApi } from '../lib/rpc-client'

export const Route = createFileRoute('/quotes/')({
  component: QuotesList,
  loader: async (): Promise<ApiQuote[]> => {
    try {
      // 使用类型安全的 RPC 客户端
      const response = await quotesApi.getAll()
      return response.data || []
    } catch (error) {
      console.error('Error fetching quotes via RPC:', error)
      return []
    }
  },
})

function QuotesList() {
  const quotes = Route.useLoaderData()
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newQuote, setNewQuote] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // 使用类型安全的 RPC 客户端创建留言
      await quotesApi.create(newQuote)
      
      // 重置表单
      setNewQuote({ name: '', email: '', message: '' })
      setShowForm(false)
      
      // 刷新页面以显示新数据
      window.location.reload()
    } catch (error) {
      console.error('Error creating quote:', error)
      alert('创建留言失败')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteQuote = async (id: number) => {
    if (!confirm('确定要删除这条留言吗？')) return

    try {
      // 使用类型安全的 RPC 客户端删除留言
      await quotesApi.delete(id.toString())
      
      // 刷新页面
      window.location.reload()
    } catch (error) {
      console.error('Error deleting quote:', error)
      alert('删除留言失败')
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-5">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="m-0 font-bold text-2xl text-gray-800">留言板</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`cursor-pointer rounded-md border-0 px-5 py-2.5 font-medium text-white transition-colors ${
            showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {showForm ? '取消' : '添加留言'}
        </button>
      </div>

      {/* 创建留言表单 */}
      {showForm && (
        <div className="mb-8 rounded-lg bg-gray-50 p-5">
          <h3 className="mt-0 font-semibold text-gray-800 text-lg">添加新留言</h3>
          <form onSubmit={handleCreateQuote} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="姓名"
              value={newQuote.name}
              onChange={(e) => setNewQuote(prev => ({ ...prev, name: e.target.value }))}
              required
              className="rounded border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="邮箱"
              value={newQuote.email}
              onChange={(e) => setNewQuote(prev => ({ ...prev, email: e.target.value }))}
              required
              className="rounded border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="留言内容"
              value={newQuote.message}
              onChange={(e) => setNewQuote(prev => ({ ...prev, message: e.target.value }))}
              required
              rows={3}
              className="resize-y rounded border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cursor-pointer rounded-md border-0 bg-gray-500 px-5 py-2.5 text-white transition-colors hover:bg-gray-600"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className={`rounded-md border-0 px-5 py-2.5 text-white transition-colors ${
                  isCreating 
                    ? "cursor-not-allowed bg-gray-500" 
                    : "cursor-pointer bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isCreating ? '提交中...' : '提交留言'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 留言列表 */}
      {quotes.length === 0 ? (
        <div className="rounded-lg bg-gray-50 px-5 py-15 text-center">
          <h3 className="mb-4 text-gray-600 text-lg">暂无留言</h3>
          <p className="mb-5 text-gray-500">成为第一个留言的人吧！</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="cursor-pointer rounded-md border-0 bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            添加留言
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {quotes.map((quote: ApiQuote) => (
            <div 
              key={quote.id} 
              className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="m-0 mb-1 font-semibold text-gray-800 text-lg">
                    {quote.name}
                  </h4>
                  <p className="m-0 text-gray-600 text-sm">
                    {quote.email}
                  </p>
                </div>
                <button 
                  type="button"
                  className="cursor-pointer rounded border-0 bg-red-600 px-3 py-1.5 text-white text-xs transition-colors hover:bg-red-700"
                  onClick={() => handleDeleteQuote(quote.id)}
                >
                  删除
                </button>
              </div>
              <div className="mb-4">
                <p className="m-0 text-gray-800 leading-relaxed">
                  {quote.message}
                </p>
              </div>
              <div className="text-gray-500 text-xs">
                {quote.createdAt ? new Date(quote.createdAt).toLocaleString('zh-CN') : '未知时间'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 