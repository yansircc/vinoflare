/** @jsxImportSource hono/jsx */
import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }, c) => {
  // 在 Cloudflare Workers 中检测环境
  const isDev = c?.env?.NODE_ENV === 'development'
  
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>留言板系统</title>
        {/* CSS 引用 - 现在使用固定文件名 */}
        {isDev ? (
          <link href="/src/app.css" rel="stylesheet" />
        ) : (
          <link href="/assets/client.css" rel="stylesheet" />
        )}
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
