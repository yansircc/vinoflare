import { Link, createFileRoute } from '@tanstack/react-router'
import { apiRequest } from '../lib/api'
import type { Quote } from '../server/db/schema'
  
export const Route = createFileRoute('/quotes/')({
  component: QuotesList,
  loader: async (): Promise<Quote[]> => {
    try {
      const data = await apiRequest<{ data: Quote[] }>('/api/quotes')
      return data.data || []
    } catch (error) {
      console.error('Error fetching quotes:', error)
      return []
    }
  },
})

function QuotesList() {
  const quotes = Route.useLoaderData()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>所有留言</h1>
        <Link 
          to="/quotes/new" 
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' }}
        >
          添加新留言
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ color: '#666', marginBottom: '15px' }}>暂无留言</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>成为第一个留言的人吧！</p>
          <Link 
            to="/quotes/new" 
            style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' }}
          >
            添加留言
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {quotes.map((quote: Quote) => (
            <div 
              key={quote.id} 
              style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '18px' }}>
                    {quote.name}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {quote.email}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link 
                    to="/quotes/$quoteId/edit" 
                    params={{ quoteId: quote.id.toString() }}
                    style={{ padding: '6px 12px', backgroundColor: '#ffc107', color: '#212529', textDecoration: 'none', borderRadius: '4px', fontSize: '12px' }}
                  >
                    编辑
                  </Link>
                  <button 
                    type="button"
                    style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    onClick={() => handleDelete(quote.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: 0, color: '#333', lineHeight: 1.6 }}>
                  {quote.message}
                </p>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {quote.createdAt ? new Date(quote.createdAt).toLocaleString('zh-CN') : '未知时间'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function handleDelete(id: number) {
  if (confirm('确定要删除这条留言吗？')) {
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        // 刷新页面
        window.location.reload()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      alert('删除失败')
    }
  }
} 