import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { toast } from 'sonner'
import { api, apiHelpers } from '../lib/api-client'

// 来自 Hono RPC 的类型定义
type CreateQuoteRequest = InferRequestType<typeof api.api.quotes.$post>['json']
type CreateQuoteResponse = InferResponseType<typeof api.api.quotes.$post>

export function QuoteList() {
  const queryClient = useQueryClient()

  // 使用 React Query 获取留言
  const { data: quotesData, isLoading, error } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const response = await api.api.quotes.$get()
      if (!response.ok) {
        throw new Error('获取留言失败')
      }
      return await response.json()
    },
  })

  // 创建留言的变更
  const createQuoteMutation = useMutation<
    CreateQuoteResponse,
    Error,
    CreateQuoteRequest
  >({
    mutationFn: async (newQuote) => {
      const response = await api.api.quotes.$post({
        json: newQuote,
      }, {
        headers: apiHelpers.withAuth(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).message || '创建留言失败')
      }
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast.success('留言创建成功！')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // 删除留言的变更
  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.api.quotes[':id'].$delete({
        param: { id: id.toString() },
      }, {
        headers: apiHelpers.withAuth(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).message || '删除留言失败')
      }
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast.success('留言删除成功！')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        加载留言时出错: {error.message}
      </div>
    )
  }

  const quotes = quotesData?.data || []

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 font-bold text-2xl">创建新留言</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createQuoteMutation.mutate({
              name: formData.get('name') as string,
              email: formData.get('email') as string,
              message: formData.get('message') as string,
            })
            e.currentTarget.reset()
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="name" className="block font-medium text-gray-700 text-sm">
              姓名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700 text-sm">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block font-medium text-gray-700 text-sm">
              留言内容
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={createQuoteMutation.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-sm text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {createQuoteMutation.isPending ? '创建中...' : '创建留言'}
          </button>
        </form>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-xl">留言 ({quotes.length})</h2>
        </div>
        <div className="divide-y">
          {quotes.map((quote: any) => (
            <div key={quote.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{quote.name}</h3>
                  <p className="text-gray-600 text-sm">{quote.email}</p>
                  <p className="mt-2 text-gray-800">{quote.message}</p>
                  <p className="mt-2 text-gray-500 text-xs">
                    {new Date(quote.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteQuoteMutation.mutate(quote.id)}
                  disabled={deleteQuoteMutation.isPending}
                  className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {quotes.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              还没有留言。创建第一条吧！
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 