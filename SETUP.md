# Drizzle + Cloudflare D1 设置指南

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

- `GET /quotes` - 获取所有留言
- `POST /quotes` - 创建新留言
  ```json
  {
    "name": "张三",
    "email": "zhangsan@example.com", 
    "message": "这是一条留言"
  }
  ``` 