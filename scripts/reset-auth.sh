#!/bin/bash

# VinoFlare 认证重置脚本
# 当更改 BETTER_AUTH_SECRET 时使用此脚本清理相关数据

echo "🔄 开始重置认证数据..."

# 清理 JWKS 表（JWT 密钥对）
echo "🧹 清理 JWKS 表..."
wrangler d1 execute vinoflare --local --command="DELETE FROM jwks;"

# 清理会话表
echo "🧹 清理会话表..."
wrangler d1 execute vinoflare --local --command="DELETE FROM session;"

# 清理账户表（OAuth 绑定）
echo "🧹 清理账户表..."
wrangler d1 execute vinoflare --local --command="DELETE FROM account;"

# 清理验证表
echo "🧹 清理验证表..."
wrangler d1 execute vinoflare --local --command="DELETE FROM verification;"

echo "✅ 认证数据重置完成!"
echo "ℹ️  用户需要重新登录"
echo "ℹ️  Better Auth 将自动生成新的 JWT 密钥对"

# 可选：显示剩余数据
echo ""
echo "📊 数据库状态："
wrangler d1 execute vinoflare --local --command="
SELECT 
  'users' as table_name, COUNT(*) as count FROM user
UNION ALL
SELECT 
  'posts' as table_name, COUNT(*) as count FROM posts  
UNION ALL
SELECT 
  'quotes' as table_name, COUNT(*) as count FROM quotes;
" 