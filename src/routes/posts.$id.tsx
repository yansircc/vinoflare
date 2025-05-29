import { Link, createFileRoute } from '@tanstack/react-router'
import { usePost } from '../lib/posts-api'

export const Route = createFileRoute('/posts/$id')({
  component: PostDetail,
})

function PostDetail() {
  const { id } = Route.useParams()
  const { data: post, isLoading, isError, error } = usePost(id)

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

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">文章不存在</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-10 text-center font-light text-2xl text-gray-900">文章详情</h1>

      {/* 文章内容 */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        {/* 文章标题和信息 */}
        <div className="mb-6 border-gray-100 border-b pb-6">
          <div className="mb-4">
            <h2 className="font-semibold text-2xl text-gray-900">{post.title}</h2>
          </div>
          <div className="text-gray-400 text-sm">
            发布于 {post.createdAt ? new Date(post.createdAt).toLocaleString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : '未知时间'}
            {post.updatedAt && (
              <>
                {' • '}
                更新于 {new Date(post.updatedAt).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </>
            )}
          </div>
        </div>

        {/* 文章内容 */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium text-gray-900">正文</h3>
          <div className="whitespace-pre-wrap text-gray-800 text-lg leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/posts"
            className="rounded-full border border-gray-300 px-6 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
          >
            返回列表
          </Link>
        </div>
      </div>

      {/* 相关信息 */}
      <div className="mt-8 text-center">
        <div className="text-gray-400 text-sm">
          文章 ID: {post.id}
        </div>
      </div>
    </div>
  )
} 