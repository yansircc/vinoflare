# Drizzle + Cloudflare D1 + Hono RPC 设置指南

## 环境变量设置

为了使用 drizzle-kit 进行数据库迁移，你需要设置以下环境变量：

创建 `.env` 文件：

```bash
# Cloudflare D1 HTTP API credentials (for drizzle-kit migrations)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_DATABASE_ID=98d98cb0-4333-4795-b18a-cfeb81da3d3b
CLOUDFLARE_D1_TOKEN=your_api_token_here
```

## 获取凭据

1. **Account ID**: 在 Cloudflare Dashboard 右侧边栏可以找到
2. **Database ID**: 已在 `wrangler.jsonc` 中配置为 `98d98cb0-4333-4795-b18a-cfeb81da3d3b`
3. **API Token**: 在 Cloudflare Dashboard > My Profile > API Tokens 创建，需要 D1:Edit 权限

## 数据库操作

```bash
# 生成迁移文件
npm run db:generate

# 应用迁移到本地开发数据库
npm run db:migrate

# 推送 schema 到远程数据库
npm run db:push

# 打开 Drizzle Studio
npm run db:studio
```

## API 端点

### REST API
- `GET /api/quotes` - 获取所有留言
- `POST /api/quotes` - 创建新留言
- `GET /api/quotes/:id` - 获取单个留言
- `PUT /api/quotes/:id` - 更新留言
- `DELETE /api/quotes/:id` - 删除留言

### 请求示例

创建留言：
```json
POST /api/quotes
{
  "name": "张三",
  "email": "zhangsan@example.com", 
  "message": "这是一条留言"
}
```

更新留言：
```json
PUT /api/quotes/1
{
  "message": "更新后的留言内容"
}
```

## Hono RPC 客户端使用

项目已配置了类型安全的 RPC 客户端，可以在前端或其他服务中使用：

```typescript
import { QuoteService } from './src/client/rpc-client'

// 获取所有留言
const quotes = await QuoteService.getAllQuotes()

// 创建新留言
const newQuote = await QuoteService.createQuote({
  name: '张三',
  email: 'zhangsan@example.com',
  message: '这是一条留言'
})

// 获取单个留言
const quote = await QuoteService.getQuote(1)

// 更新留言
const updatedQuote = await QuoteService.updateQuote(1, {
  message: '更新后的内容'
})

// 删除留言
await QuoteService.deleteQuote(1)
```

## 项目结构

```
src/
├── server/
│   ├── db/
│   │   ├── index.ts          # 数据库连接配置
│   │   └── schema.ts         # 数据库表结构
│   └── routers/
│       └── quote-router.ts   # 留言 CRUD 路由
├── client/
│   └── rpc-client.ts         # RPC 客户端
└── index.tsx                 # 主应用入口
```

## 特性

- ✅ 类型安全的 API 调用
- ✅ Zod 数据验证
- ✅ 完整的 CRUD 操作
- ✅ 错误处理
- ✅ SQLite + Cloudflare D1
- ✅ Drizzle ORM
- ✅ Hono RPC 