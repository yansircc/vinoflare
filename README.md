# create-vinoflare

🚀 A modern CLI tool for scaffolding full-stack TypeScript applications on Cloudflare Workers with Hono, React, and Vite.

<p align="center">
  <img src="https://img.shields.io/npm/v/create-vinoflare.svg" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/create-vinoflare.svg" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/yansircc/create-vinoflare.svg" alt="license" />
</p>

## 🌟 Features

- **🏗️ Multiple Templates**: Choose from 9 different configurations
- **⚡ Lightning Fast**: Powered by Bun for ultra-fast installation
- **🔧 Zero Config**: Works out of the box with sensible defaults
- **📦 TypeScript First**: Full type safety from database to frontend
- **🌐 Edge Native**: Built for Cloudflare Workers
- **🎯 Interactive & Non-Interactive**: Use prompts or flags

## 🚀 Quick Start

```bash
# Using npm
npm create vinoflare@latest my-app

# Using bun
bun create vinoflare my-app

# Using pnpm
pnpm create vinoflare my-app

# Using yarn
yarn create vinoflare my-app
```

## 📋 Templates

Choose from 9 pre-configured templates:

### Full-Stack Templates (Orval/OpenAPI)
| Template | Frontend | Database | Auth | API Client | Description |
|----------|----------|----------|------|------------|-------------|
| `full-stack` | ✅ React + TanStack Router | ✅ Cloudflare D1 | ✅ Better Auth | Orval | Complete full-stack app with OpenAPI client |
| `full-stack --no-auth` | ✅ React + TanStack Router | ✅ Cloudflare D1 | ❌ | Orval | Full-stack app without auth |
| `full-stack --no-db` | ✅ React + TanStack Router | ❌ | ❌ | Orval | Frontend with API, no database |

### Full-Stack Templates (Hono RPC)
| Template | Frontend | Database | Auth | API Client | Description |
|----------|----------|----------|------|------------|-------------|
| `full-stack --rpc` | ✅ React + TanStack Router | ✅ Cloudflare D1 | ✅ Better Auth | Hono RPC | Complete full-stack app with type-safe RPC |
| `full-stack --rpc --no-auth` | ✅ React + TanStack Router | ✅ Cloudflare D1 | ❌ | Hono RPC | Full-stack app with RPC, no auth |
| `full-stack --rpc --no-db` | ✅ React + TanStack Router | ❌ | ❌ | Hono RPC | Frontend with RPC API, no database |

### API-Only Templates
| Template | Frontend | Database | Auth | Description |
|----------|----------|----------|------|-------------|
| `api-only` | ❌ | ✅ Cloudflare D1 | ✅ Better Auth | REST API with auth and database |
| `api-only --no-auth` | ❌ | ✅ Cloudflare D1 | ❌ | REST API with database, no auth |
| `api-only --no-db` | ❌ | ❌ | ❌ | Stateless REST API |

## 🎮 Interactive Mode

Simply run the command without flags for an interactive experience:

```bash
npm create vinoflare@latest
```

You'll be prompted to:
1. Enter your project name
2. Choose between full-stack or API-only
3. Select database preference
4. Select auth preference (if database enabled)
5. Choose API client type (Orval or Hono RPC, for full-stack only)
6. Decide on git initialization
7. Choose package manager

## 🚦 Non-Interactive Mode

Perfect for automation and CI/CD:

```bash
# Full-stack with all features
npm create vinoflare@latest my-app --yes

# API-only without auth
npm create vinoflare@latest my-api --type=api-only --no-auth --yes

# Full-stack without database
npm create vinoflare@latest my-frontend --type=full-stack --no-db --yes

# With specific package manager
npm create vinoflare@latest my-app --pm=bun --yes

# Full-stack with Hono RPC
npm create vinoflare@latest my-rpc-app --type=full-stack --rpc --yes
```

### Available Flags

- `--type=<type>` - Project type: `full-stack` (default) or `api-only`
- `--rpc` - Use Hono RPC client instead of Orval (full-stack only)
- `--no-auth` - Exclude authentication
- `--no-db` - Exclude database
- `--no-git` - Skip git initialization
- `--no-install` - Skip dependency installation
- `--pm=<pm>` - Package manager: `npm`, `yarn`, `pnpm`, or `bun`
- `-y, --yes` - Accept all defaults (non-interactive mode)

## 🛠️ What's Included

### Full-Stack Templates
- **Frontend**: React 19 + Vite + TanStack Router
- **Styling**: Tailwind CSS v4
- **API Client**: Choose between:
  - **Orval**: OpenAPI-based client with auto-generated hooks
  - **Hono RPC**: Type-safe RPC client with end-to-end type inference
- **Type Safety**: End-to-end from DB to UI

### API Templates
- **Framework**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 with Drizzle ORM
- **Auth**: Better Auth with Discord OAuth
- **API Docs**: Auto-generated OpenAPI with Scalar UI

### Developer Experience
- **Hot Reload**: Lightning-fast development
- **Type Generation**: Automatic types for routes, API, and DB
- **Testing**: Vitest with Cloudflare Workers support
- **Linting**: Biome for fast, opinionated formatting
- **Module Generator**: Scaffold CRUD modules instantly

## 📚 Post-Installation

After creating your project, you'll see tailored next steps:

### For Database Projects
```bash
cd my-app
npm run db:generate    # Generate migrations
npm run db:push:local  # Apply to local DB
npm run gen:types      # Generate TypeScript types
```

### For Auth Projects
1. Copy `.dev.vars.example` to `.dev.vars`
2. Add your Discord OAuth credentials
3. Set `BETTER_AUTH_SECRET`

### For Frontend Projects
```bash
npm run gen:routes  # Generate route types

# For Orval templates:
npm run gen:api     # Generate OpenAPI client

# For RPC templates:
npm run gen:client  # Generate RPC client
```

## 🔧 Development Workflow

```bash
# Start dev server
npm run dev

# Generate a new module
npm run gen:module posts

# Run tests
npm run test

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
```

## 🧪 Testing

The CLI includes comprehensive test suites:

```bash
# Run tests sequentially
npm run test:e2e

# Run tests in parallel (faster)
npm run test:parallel
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [yansir](https://github.com/yansircc)

## 🙏 Acknowledgments

Built with and for the amazing Cloudflare Workers ecosystem:
- [Hono](https://hono.dev) - Ultrafast web framework
- [Drizzle](https://orm.drizzle.team) - TypeScript ORM
- [Better Auth](https://better-auth.com) - Modern auth library
- [TanStack Router](https://tanstack.com/router) - Type-safe routing

---

<p align="center">Made with ❤️ by the Vinoflare team</p>