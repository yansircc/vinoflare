import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import React from 'react'

export const Route = createRootRoute({
  component: () => (
    <div>
      <div style={{ padding: '20px', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#333' }}>留言板系统</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link 
              to="/" 
              style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}
              activeProps={{ style: { color: '#0056b3', fontWeight: 'bold' } }}
            >
              首页
            </Link>
            <Link 
              to="/quotes" 
              style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}
              activeProps={{ style: { color: '#0056b3', fontWeight: 'bold' } }}
            >
              留言列表
            </Link>
            <Link 
              to="/quotes/new" 
              style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}
              activeProps={{ style: { color: '#0056b3', fontWeight: 'bold' } }}
            >
              添加留言
            </Link>
          </div>
        </nav>
      </div>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
}) 