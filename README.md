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
- 🎨 **Flexible architecture** - Optional D1 Database and Better Auth integration
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
3. **Include D1 Database?**
4. **Include Better Auth?** (only if database is included)
5. **Install dependencies?** 
6. **Initialize project?** (generates types, routes, sets up database if included)
7. **Initialize git repository?**

### Architecture Options

You can create projects with different combinations:
- ✅ **Full Featured** - D1 Database + Better Auth (default)
- 📊 **Database Only** - D1 Database without auth
- ⚡ **Minimal API** - No database, no auth (pure API server)

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
- Better Auth for authentication (optional)
- Drizzle ORM with D1 database (optional)
- OpenAPI documentation
- TypeScript, Biome, Vitest

### API-only
Hono API server with:
- Cloudflare Workers runtime
- Better Auth for authentication (optional)
- Drizzle ORM with D1 database (optional)
- OpenAPI documentation
- TypeScript, Biome, Vitest

## Architecture Details

Based on your choices, the CLI will automatically:

### Without Database
- Remove all database-related files and dependencies
- Remove Drizzle ORM configuration
- Remove database middleware
- Remove `db:*` commands from package.json
- Simplify the project to a pure API server

### Without Auth (when database is included)
- Remove Better Auth integration
- Remove auth middleware and guards
- Remove auth-related API endpoints
- Remove login/profile pages (full-stack)
- Keep database for other features