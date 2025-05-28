/** @jsxImportSource hono/jsx */
import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(({ children }) => {
  // 检测是否为开发环境
  const isDev = process.env.NODE_ENV === 'development'
  
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>留言板系统</title>
        <ViteClient />
        <Link href="/src/app.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        {isDev ? (
          <script type="module" src="/src/client.tsx" />
        ) : (
          <script type="module" src="/static/client.js" />
        )}
      </body>
    </html>
  )
})
