import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>欢迎使用留言板系统</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        这是一个基于 Hono + TanStack Router + Drizzle ORM + Cloudflare D1 构建的现代留言板应用
      </p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
        <Link 
          to="/quotes" 
          style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' }}
        >
          查看所有留言
        </Link>
        <Link 
          to="/quotes/new" 
          style={{ padding: '12px 24px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' }}
        >
          添加新留言
        </Link>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', textAlign: 'left' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>技术栈</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
            🚀 <strong>Hono</strong> - 轻量级、快速的 Web 框架
          </li>
          <li style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
            🧭 <strong>TanStack Router</strong> - 类型安全的文件路由系统
          </li>
          <li style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
            🗄️ <strong>Drizzle ORM</strong> - 现代 TypeScript ORM
          </li>
          <li style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
            ☁️ <strong>Cloudflare D1</strong> - 边缘数据库
          </li>
          <li style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
            ⚡ <strong>Vite</strong> - 快速构建工具
          </li>
        </ul>
      </div>
    </div>
  )
} 