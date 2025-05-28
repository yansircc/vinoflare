# 留言板系统

一个基于现代技术栈构建的全栈留言板应用，展示了 Hono + TanStack Router + Drizzle ORM + Cloudflare D1 + Tailwind CSS 的完美集成。

## ✨ 特性

- 🚀 **Hono** - 轻量级、快速的 Web 框架
- 🧭 **TanStack Router** - 类型安全的文件路由系统
- 🗄️ **Drizzle ORM** - 现代 TypeScript ORM
- ☁️ **Cloudflare D1** - 边缘数据库
- ⚡ **Vite** - 快速构建工具
- 🔗 **Hono RPC** - 类型安全的远程过程调用
- 🎨 **Tailwind CSS v4.1** - 现代原子化 CSS 框架

## 🏗️ 技术架构

### 前端
- **TanStack Router** - 文件路由系统，类型安全
- **React** - 用户界面库
- **Tailwind CSS** - 原子化 CSS，按需生成
- **Hono RPC Client** - 类型安全的 API 调用

### 后端
- **Hono** - Web 框架，支持 JSX 和 RPC
- **Drizzle ORM** - 数据库操作
- **Cloudflare D1** - SQLite 兼容的边缘数据库
- **Zod** - 运行时类型验证

### 开发工具
- **TypeScript** - 类型安全
- **Vite** - 构建工具和开发服务器
- **@tailwindcss/vite** - Tailwind CSS Vite 插件

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 部署到 Cloudflare Workers
```bash
npm run deploy
```

## 📁 项目结构

```
src/
├── index.tsx                 # Hono 服务器 + AppType 导出
├── client.tsx               # 客户端入口
├── renderer.tsx             # HTML 渲染器
├── app.css                  # Tailwind CSS 入口
├── lib/
│   └── rpc-client.ts        # RPC 客户端封装
├── routes/
│   ├── index.tsx            # 主页
│   └── quotes.index.tsx     # 留言页面
└── server/
    ├── db/                  # 数据库配置
    │   ├── index.ts         # 数据库连接
    │   └── schema.ts        # 数据表结构
    └── routers/             # API 路由
        └── quote-router.ts  # 留言 API
```

## 🎨 设计系统

### 颜色方案
- **主色调**：`blue-600` / `blue-700` (主要按钮)
- **次要色调**：`gray-500` / `gray-600` (取消按钮)
- **成功色调**：`green-600` / `green-700` (添加按钮)
- **危险色调**：`red-600` / `red-700` (删除按钮)
- **背景色调**：`gray-50` (卡片背景)、`white` (内容背景)

### 间距系统
- **容器**：`max-w-4xl` (最大宽度)
- **内边距**：`p-5` (常规)、`p-8` (大)
- **外边距**：`mb-8` (常规)、`mb-10` (大)
- **间隙**：`gap-4` (表单)、`gap-5` (列表)

### 交互效果
- **悬停**：`hover:bg-*-700` (按钮变深)
- **焦点**：`focus:ring-2 focus:ring-blue-500` (输入框)
- **过渡**：`transition-colors` (颜色变化)

## 🔗 Hono RPC 特性

- **类型安全**：客户端和服务端共享类型定义，编译时检查错误
- **自动补全**：IDE 提供完整的 API 方法和参数提示
- **运行时验证**：使用 Zod 进行请求和响应验证
- **错误处理**：统一的错误处理和状态码管理
- **性能优化**：避免手动构建 URL 和处理序列化

## 📚 相关文档

- [Hono RPC 集成指南](./HONO_RPC_WITH_TANSTACK_ROUTER.md)
- [Tailwind CSS 迁移指南](./TAILWIND_MIGRATION.md)

## 🛠️ 开发说明

### 数据库
项目使用 Cloudflare D1 作为数据库，在开发环境中会自动创建本地 SQLite 文件。

### 路由
使用 TanStack Router 的文件路由系统，路由文件位于 `src/routes/` 目录。

### API
使用 Hono RPC 提供类型安全的 API 调用，API 路由位于 `src/server/routers/` 目录。

### 样式
使用 Tailwind CSS v4.1 提供原子化 CSS，支持按需生成和现代 CSS 特性。

## 📄 许可证

MIT License

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
