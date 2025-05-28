# 极简留言板系统

一个基于现代技术栈构建的极简风格留言板应用，展示了 TanStack Query + TanStack Router + TanStack Form + Hono + Tailwind CSS 的完美集成。

## ✨ 特性

- 🚀 **TanStack Query** - 强大的数据获取和状态管理
- 🧭 **TanStack Router** - 类型安全的文件路由系统
- 📝 **TanStack Form** - 无头表单状态管理和验证
- 🔍 **Zod** - TypeScript 优先的模式验证
- 🗄️ **Drizzle ORM** - 现代 TypeScript ORM
- ☁️ **Cloudflare D1** - 边缘数据库
- ⚡ **Vite** - 快速构建工具
- 🎨 **Tailwind CSS v4.1** - 极简原子化 CSS 框架
- 🔗 **Hono RPC** - 类型安全的远程过程调用

## 🎨 设计理念

### 极简主义
- **少即是多** - 移除不必要的装饰元素
- **功能优先** - 每个元素都有明确的功能目的
- **灰度美学** - 以灰度色彩为主的优雅配色
- **宽松布局** - 充足的留白和舒适的间距

### 用户体验
- **即时反馈** - TanStack Query 提供的乐观更新
- **智能缓存** - 自动缓存管理，减少网络请求
- **表单验证** - TanStack Form + Zod 提供强大的验证体验
- **错误处理** - 优雅的错误状态展示
- **响应式设计** - 移动端优先的响应式布局

## 🏗️ 技术架构

### 前端技术栈
- **TanStack Query** - 数据获取、缓存和状态管理
- **TanStack Router** - 文件路由系统，类型安全
- **TanStack Form** - 表单状态管理和验证
- **React** - 用户界面库
- **Zod** - 运行时类型验证和模式定义
- **Tailwind CSS** - 原子化 CSS，极简设计
- **TypeScript** - 类型安全

### 后端技术栈
- **Hono** - 轻量级 Web 框架，支持 JSX 和 RPC
- **Drizzle ORM** - 数据库操作
- **Cloudflare D1** - SQLite 兼容的边缘数据库
- **Zod** - 运行时类型验证

### 开发工具
- **Vite** - 构建工具和开发服务器
- **@tailwindcss/vite** - Tailwind CSS Vite 插件
- **React Query Devtools** - 查询调试工具

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
├── client.tsx               # 客户端入口 + QueryClient 配置
├── renderer.tsx             # HTML 渲染器
├── app.css                  # Tailwind CSS 入口
├── lib/
│   ├── query-client.ts      # QueryClient 配置
│   ├── quotes-api.ts        # TanStack Query hooks
│   └── quote-schema.ts      # Zod 验证模式
├── components/
│   └── QuoteForm.tsx        # TanStack Form 组件
├── routes/
│   ├── index.tsx            # 主页（极简设计）
│   └── quotes.index.tsx     # 留言页面（极简设计）
└── server/
    ├── db/                  # 数据库配置
    │   ├── index.ts         # 数据库连接
    │   └── schema.ts        # 数据表结构
    └── routers/             # API 路由
        └── quote-router.ts  # 留言 API
```

## 🎨 设计系统

### 色彩方案
```css
/* 主色调 */
gray-900    /* 深灰色 - 主要按钮和文字 */
gray-700    /* 中灰色 - 悬停状态 */

/* 次要色调 */
gray-500    /* 浅灰色 - 次要文字 */
gray-400    /* 更浅灰色 - 占位符文字 */

/* 背景色调 */
white       /* 主背景 */
gray-50     /* 卡片背景 */

/* 边框色调 */
gray-200    /* 边框 */
gray-100    /* 分割线 */
```

### 字体系统
```css
/* 主标题 */
text-4xl md:text-5xl font-light

/* 页面标题 */
text-2xl font-light

/* 卡片标题 */
text-xl font-medium

/* 正文 */
text-base leading-relaxed

/* 小字 */
text-sm / text-xs
```

### 间距系统
```css
/* 容器宽度 */
max-w-2xl    /* 留言页面 */
max-w-4xl    /* 主页 */

/* 内边距 */
px-4         /* 移动端水平间距 */
py-8         /* 常规垂直间距 */
py-16        /* 大垂直间距 */

/* 组件间距 */
space-y-6    /* 列表项间距 */
gap-3        /* 小元素间距 */
```

## 📝 表单验证特性

### TanStack Form + Zod 集成
- **类型安全验证** - Zod schema 自动推断类型
- **实时验证反馈** - onChange 验证提供即时反馈
- **多层验证规则** - 字段级和表单级验证
- **自定义验证逻辑** - 支持复杂的业务规则验证

### 验证规则示例
```typescript
// 姓名验证
name: z
  .string()
  .min(2, '姓名至少需要2个字符')
  .max(50, '姓名不能超过50个字符')
  .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, '只能包含中文、英文和空格')

// 邮箱验证
email: z
  .string()
  .email('请输入有效的邮箱地址')
  .max(100, '邮箱地址不能超过100个字符')

// 留言内容验证
message: z
  .string()
  .min(10, '留言内容至少需要10个字符')
  .max(500, '留言内容不能超过500个字符')
  .refine(
    (value) => !value.includes('spam'),
    '留言内容不能包含垃圾信息'
  )
```

## 🔗 TanStack Query 特性

### 智能缓存
- **自动缓存管理** - 5分钟数据新鲜度，30分钟缓存时间
- **请求去重** - 相同查询自动去重
- **后台更新** - 数据在后台自动更新

### 状态管理
- **加载状态** - 自动管理 `isLoading`、`isPending` 状态
- **错误处理** - 统一的错误处理和重试机制
- **乐观更新** - 即时 UI 反馈，提升用户体验

### 开发体验
- **类型安全** - 完整的 TypeScript 支持
- **开发工具** - React Query Devtools 调试支持
- **代码复用** - 可复用的 hooks 和查询逻辑

## 📚 相关文档

- [TanStack Form 集成指南](./TANSTACK_FORM_INTEGRATION.md)
- [TanStack Query 迁移指南](./TANSTACK_QUERY_MIGRATION.md)
- [Tailwind CSS 迁移指南](./TAILWIND_MIGRATION.md)

## 🛠️ 开发说明

### 数据库
项目使用 Cloudflare D1 作为数据库，在开发环境中会自动创建本地 SQLite 文件。

### 路由
使用 TanStack Router 的文件路由系统，路由文件位于 `src/routes/` 目录。

### API
使用 Hono RPC 提供类型安全的 API 调用，通过 TanStack Query hooks 进行数据管理。

### 表单
使用 TanStack Form + Zod 提供强大的表单状态管理和验证功能。

### 样式
使用 Tailwind CSS v4.1 提供原子化 CSS，采用极简设计理念。

## 🎯 核心优势

### 与传统方案对比

| 特性 | 传统方案 | 本项目 |
|------|----------|--------|
| 数据获取 | 手动 fetch | TanStack Query |
| 缓存管理 | 手动管理 | 自动缓存 |
| 表单验证 | 手动验证 | TanStack Form + Zod |
| 加载状态 | 手动处理 | 自动管理 |
| 错误处理 | 分散处理 | 统一处理 |
| 设计风格 | 装饰性强 | 极简功能性 |
| 开发体验 | 复杂配置 | 开箱即用 |

### 性能优化
- ✅ **智能缓存** - 减少不必要的网络请求
- ✅ **并行查询** - 支持并行数据获取
- ✅ **最小重渲染** - TanStack Form 优化渲染性能
- ✅ **按需生成** - Tailwind CSS 按需生成样式
- ✅ **类型安全** - 编译时错误检查

## 📄 许可证

MIT License

---

> 这个项目展示了现代 React 应用的最佳实践，结合了强大的数据管理能力、优秀的表单体验和优雅的极简设计。

```txt
npm run cf-typegen
```

Pass the `Env` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: Env }>()
```
