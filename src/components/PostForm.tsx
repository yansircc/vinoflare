import { type AnyFieldApi, useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { type PostFormData, defaultPostFormValues, postFormSchema } from '../lib/post-schema'
import { useCreatePost } from '../lib/posts-api'

interface PostFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

// 错误提示组件
function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid && (
				<div className="mt-1 text-red-500 text-sm">
					{field.state.meta.errors.map((err) => err.message).join(", ")}
				</div>
			)}
			{field.state.meta.isValidating && <div className="mt-1 text-gray-400 text-xs">验证中...</div>}
		</>
	);
}

export function PostForm({ onSuccess, onCancel }: PostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createPostMutation = useCreatePost()

  const form = useForm({
    defaultValues: defaultPostFormValues,
    onSubmit: async ({ value }: { value: PostFormData }) => {
      setIsSubmitting(true)
      try {
        await createPostMutation.mutateAsync(value)
        form.reset()
        onSuccess?.()
      } catch (error) {
        console.error('保存失败：', error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* 标题字段 */}
        <form.Field name="title" validators={{
          onBlur: postFormSchema.shape.title,
        }}>
          {(field) => (
            <div>
              <label htmlFor={field.name} className="mb-2 block font-medium text-gray-700 text-sm">
                标题 *
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="请输入文章标题"
                className="w-full border-0 border-gray-200 border-b bg-transparent px-0 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0"
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        {/* 内容字段 */}
        <form.Field name="content" validators={{
          onBlur: postFormSchema.shape.content,
        }}>
          {(field) => (
            <div>
              <label htmlFor={field.name} className="mb-2 block font-medium text-gray-700 text-sm">
                内容 *
              </label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="请输入文章内容（至少10个字符）"
                rows={6}
                className="w-full resize-none border-0 border-gray-200 border-b bg-transparent px-0 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0"
              />
              <FieldInfo field={field} />
              <div className="mt-1 text-gray-400 text-xs">
                {field.state.value.length}/5000
              </div>
            </div>
          )}
        </form.Field>

        {/* 表单级别错误 */}
        <form.Subscribe selector={(state) => state.errors}>
          {(errors) =>
            errors.length > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="text-red-700 text-sm">
                  {errors.map((error, index) => (
                    <div key={index}>{String(error)}</div>
                  ))}
                </div>
              </div>
            )
          }
        </form.Subscribe>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-gray-300 px-6 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
            >
              取消
            </button>
          )}
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isFormSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || isFormSubmitting}
                className="rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSubmitting || isFormSubmitting ? '发布中...' : '发布文章'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
} 