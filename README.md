# create-vinoflare

Create modern full-stack apps with Vinoflare (Hono + Vite + Cloudflare).

## Features

- 🚀 **Full-stack or API-only** - Choose between a complete app or just the backend
- 🔐 **Authentication Ready** - Optional Better Auth integration
- 🗄️ **Database Support** - Optional Cloudflare D1 with Drizzle ORM
- ⚡ **Lightning Fast** - Powered by Hono, Vite, and Cloudflare Workers
- 🎯 **Type-Safe** - Full TypeScript support throughout
- 📦 **Zero Config** - Sensible defaults, ready to deploy

## Quick Start

```bash
# With npm
npm create vinoflare@latest my-app

# With yarn
yarn create vinoflare my-app

# With pnpm
pnpm create vinoflare my-app

# With bun
bun create vinoflare my-app
```

## CLI Options

```bash
create-vinoflare [name] [options]

Options:
  -t, --type <type>        Project type (full-stack or api-only)
  --no-auth                Exclude authentication
  --no-db                  Exclude database
  -y, --yes                Skip prompts and use defaults
  --no-install             Skip dependency installation
  --no-git                 Skip git initialization
  --pm <pm>                Package manager to use
  -h, --help               Display help
  -V, --version            Display version
```

## Project Templates

### Full-stack (Default)
- React with TanStack Router
- Hono API backend
- Shared types between frontend and backend
- Optional database and authentication

### API-only
- Hono API server for Cloudflare Workers
- OpenAPI documentation
- Optional database and authentication

## Authentication Setup

If you include authentication, you'll need to:

1. Copy `.dev.vars.example` to `.dev.vars`
2. Add your Discord OAuth credentials
3. See the generated README for detailed setup

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Run tests
bun run test:e2e
```

## License

MIT