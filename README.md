# create-vino-app

A simple CLI to scaffold modern full-stack applications with Hono and TanStack Router.

## Usage

```bash
npx create-vino-app my-app
# or
bunx create-vino-app my-app
# or
pnpm create vino-app my-app
# or
yarn create vino-app my-app
```

## Features

- 🚀 **Smart package manager detection** - Automatically detects and uses your preferred package manager
- 📦 **Project templates** - Choose between full-stack or API-only
- 🔧 **Auto initialization** - Optionally generate types, routes, and setup database
- 🎯 **Git integration** - Initialize git repo with formatted code and initial commit
- ⚡ **Command line arguments** - Pass project name directly to skip prompts

## Options

### Interactive Prompts

The CLI will guide you through:
1. **Project name** (skipped if provided as argument)
2. **Project type**:
   - Full-stack app (Hono API + React with TanStack Router)
   - API server only (Hono)
3. **Install dependencies?** 
4. **Initialize project?** (generates types, routes, sets up database)
5. **Initialize git repository?**

### Command Line Flags

```bash
create-vino-app my-app --no-install  # Skip dependency installation
create-vino-app my-app --no-git      # Skip git initialization
```

## Development

```bash
# Install dependencies
bun install

# Build the CLI
bun build

# Link for local testing
bun link

# Test locally
create-vino-app test-app
```

## Templates

### Full-stack
Complete application with:
- Hono backend on Cloudflare Workers
- React frontend with TanStack Router
- Better Auth for authentication
- Drizzle ORM with D1 database
- OpenAPI documentation
- TypeScript, Biome, Vitest

### API-only
Hono API server with:
- Cloudflare Workers runtime
- Better Auth for authentication
- Drizzle ORM with D1 database
- OpenAPI documentation
- TypeScript, Biome, Vitest