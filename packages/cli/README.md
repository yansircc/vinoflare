# create-vinoflare

快速创建一个新的 Vinoflare 应用。

## 使用方法

### 使用 Bun（推荐）

```bash
bunx create-vinoflare@latest
```

### 使用 npm

```bash
npx create-vinoflare@latest
```

### 使用 pnpm

```bash
pnpm create vinoflare@latest
```

### 使用 Yarn

```bash
yarn create vinoflare
```

## 交互式创建

运行上述任何命令后，CLI 会引导你完成项目创建过程：

1. **项目名称** - 输入你的项目名称
2. **安装依赖** - 选择是否自动安装依赖
3. **Git 仓库** - 选择是否初始化 Git 仓库
4. **初始化设置** - 选择是否运行 `bun setup` 进行项目初始化

## 非交互式创建

你也可以通过命令行参数跳过交互式提示：

```bash
bunx create-vinoflare@latest my-app --yes
```

这将使用默认选项创建项目：
- ✅ 安装依赖
- ✅ 初始化 Git
- ✅ 运行初始化设置

## 项目结构

创建的项目包含：

- 🚀 **Vite + Hono + Cloudflare Workers** 全栈架构
- 🔐 **Better Auth** 认证系统
- 📊 **Drizzle ORM + D1** 数据库
- 🎨 **TanStack Router** 文件路由
- 📝 **OpenAPI** 自动生成文档
- 🛠️ **TypeScript** 端到端类型安全

## License

MIT