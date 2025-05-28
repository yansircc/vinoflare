import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { apiRequest } from '../lib/api'
import type { Quote } from '../server/db/schema'

interface FormData {
  name: string
  email: string
  message: string
}

export const Route = createFileRoute('/quotes/$quoteId/edit')({
  component: EditQuote,
  loader: async ({ params }): Promise<Quote> => {
    try {
      const data = await apiRequest<{ data: Quote }>(`/api/quotes/${params.quoteId}`)
      return data.data
    } catch (error) {
      console.error('Error fetching quote:', error)
      throw error
    }
  },
})

function EditQuote() {
  const router = useRouter()
  const quote = Route.useLoaderData()
  const { quoteId } = Route.useParams()
  
  const [formData, setFormData] = useState<FormData>({
    name: quote.name,
    email: quote.email,
    message: quote.message,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // 更新成功，跳转到留言列表
        router.navigate({ to: '/quotes' })
      } else {
        const errorData: { message?: string } = await response.json()
        alert(errorData.message || '更新失败')
      }
    } catch (error) {
      alert('更新失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>编辑留言</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
            姓名 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '6px', fontSize: '16px', transition: 'border-color 0.2s' }}
            placeholder="请输入您的姓名"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
            邮箱 *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '6px', fontSize: '16px', transition: 'border-color 0.2s' }}
            placeholder="请输入您的邮箱地址"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
            留言内容 *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '6px', fontSize: '16px', resize: 'vertical', transition: 'border-color 0.2s' }}
            placeholder="请输入您的留言内容"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => router.navigate({ to: '/quotes' })}
            style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: isSubmitting ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '16px', 
              cursor: isSubmitting ? 'not-allowed' : 'pointer', 
              transition: 'background-color 0.2s' 
            }}
          >
            {isSubmitting ? '更新中...' : '更新留言'}
          </button>
        </div>
      </form>
    </div>
  )
} 