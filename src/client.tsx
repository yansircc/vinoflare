import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

// 导入 CSS 文件
import './app.css'

import { isDev } from './lib/env'
import { createQueryClient } from './lib/query-client'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  // 使用 useState 确保 QueryClient 实例在组件生命周期内保持稳定
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {isDev() && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    React.createElement(
      StrictMode,
      null,
      React.createElement(App)
    )
  )
} 