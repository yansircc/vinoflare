# create-vinoflare

🚀 一个现代化的 CLI 工具，用于在 Cloudflare Workers 上快速搭建基于 Hono、React 和 Vite 的全栈 TypeScript 应用。

<p align="center">
  <img src="https://img.shields.io/npm/v/create-vinoflare.svg" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/create-vinoflare.svg" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/yansircc/create-vinoflare.svg" alt="license" />
</p>

## 🌟 特性

- **🏗️ 多种模板**: 提供 6 种不同配置可选
- **⚡ 极速安装**: 由 Bun 驱动，安装速度超快
- **🔧 零配置**: 开箱即用，默认配置合理
- **📦 TypeScript 优先**: 从数据库到前端的完整类型安全
- **🌐 边缘原生**: 专为 Cloudflare Workers 构建
- **🎯 交互式和非交互式**: 支持提示和命令行参数

## 🚀 快速开始

```bash
# 使用 npm
npm create vinoflare@latest my-app

# 使用 bun
bun create vinoflare my-app

# 使用 pnpm
pnpm create vinoflare my-app

# 使用 yarn
yarn create vinoflare my-app
```

## 📋 模板

选择 6 种预配置模板之一：

| 模板 | 前端 | 数据库 | 认证 | 描述 |
|------|------|--------|------|------|
| `full-stack` | ✅ React + TanStack Router | ✅ Cloudflare D1 | ✅ Better Auth | 带认证的完整全栈应用 |
| `full-stack --no-auth` | ✅ React + TanStack Router | ✅ Cloudflare D1 | ❌ | 不带认证的全栈应用 |
| `full-stack --no-db` | ✅ React + TanStack Router | ❌ | ❌ | 带 API 的前端应用，无数据库 |
| `api-only` | ❌ | ✅ Cloudflare D1 | ✅ Better Auth | 带认证和数据库的 REST API |
| `api-only --no-auth` | ❌ | ✅ Cloudflare D1 | ❌ | 带数据库的 REST API，无认证 |
| `api-only --no-db` | ❌ | ❌ | ❌ | 无状态 REST API |

## 🎮 交互模式

无需任何参数即可获得交互式体验：

```bash
npm create vinoflare@latest
```

系统将提示您：
1. 输入项目名称
2. 选择全栈或仅 API
3. 选择是否需要认证
4. 选择是否需要数据库
5. 选择包管理器
6. 决定是否初始化 git

## 🚦 非交互模式

非常适合自动化和 CI/CD：

```bash
# 带所有功能的全栈应用
npm create vinoflare@latest my-app --yes

# 无认证的 API
npm create vinoflare@latest my-api --type=api-only --no-auth --yes

# 无数据库的全栈应用
npm create vinoflare@latest my-frontend --type=full-stack --no-db --yes

# 指定包管理器
npm create vinoflare@latest my-app --pm=bun --yes
```

### 可用参数

- `--type=<type>` - 项目类型：`full-stack`（默认）或 `api-only`
- `--no-auth` - 不包含认证
- `--no-db` - 不包含数据库
- `--no-git` - 跳过 git 初始化
- `--no-install` - 跳过依赖安装
- `--pm=<pm>` - 包管理器：`npm`、`yarn`、`pnpm` 或 `bun`
- `-y, --yes` - 接受所有默认值（非交互模式）

## 🛠️ 包含内容

### 全栈模板
- **前端**: React 19 + Vite + TanStack Router
- **样式**: Tailwind CSS v4
- **API 客户端**: 使用 Orval 自动生成
- **类型安全**: 从数据库到 UI 的端到端类型

### API 模板
- **框架**: Cloudflare Workers 上的 Hono
- **数据库**: 带 Drizzle ORM 的 Cloudflare D1
- **认证**: 带 Discord OAuth 的 Better Auth
- **API 文档**: 使用 Scalar UI 自动生成 OpenAPI

### 开发体验
- **热重载**: 极速开发
- **类型生成**: 自动生成路由、API 和数据库类型
- **测试**: 支持 Cloudflare Workers 的 Vitest
- **代码检查**: 使用 Biome 进行快速、固执的格式化
- **模块生成器**: 即时搭建 CRUD 模块

## 📚 安装后步骤

创建项目后，您将看到定制的后续步骤：

### 对于数据库项目
```bash
cd my-app
npm run db:generate    # 生成迁移
npm run db:push:local  # 应用到本地数据库
npm run gen:types      # 生成 TypeScript 类型
```

### 对于认证项目
1. 复制 `.dev.vars.example` 到 `.dev.vars`
2. 添加您的 Discord OAuth 凭据
3. 设置 `BETTER_AUTH_SECRET`

### 对于前端项目
```bash
npm run gen:routes  # 生成路由类型
npm run gen:api     # 生成 API 客户端
```

## 🔧 开发工作流

```bash
# 启动开发服务器
npm run dev

# 生成新模块
npm run gen:module posts

# 运行测试
npm run test

# 构建生产版本
npm run build

# 部署到 Cloudflare
npm run deploy
```

## 🧪 测试

CLI 包含全面的测试套件：

```bash
# 顺序运行测试
npm run test:e2e

# 并行运行测试（更快）
npm run test:parallel
```

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 此仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m '添加一些很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 📄 许可证

MIT © [yansir](https://github.com/yansircc)

## 🙏 致谢

为 Cloudflare Workers 生态系统构建：
- [Hono](https://hono.dev) - 超快的 Web 框架
- [Drizzle](https://orm.drizzle.team) - TypeScript ORM
- [Better Auth](https://better-auth.com) - 现代认证库
- [TanStack Router](https://tanstack.com/router) - 类型安全的路由

---

<p align="center">由 Vinoflare 团队用 ❤️ 制作</p>