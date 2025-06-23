# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare is a full-stack TypeScript template combining **Vi**te + Ho**no** + Cloud**flare** Workers with Better Auth, TanStack Router, and Drizzle ORM for type-safe edge computing applications.

## Essential Commands

### Development
```bash
bun dev                    # Start dev server on port 5173
bun gen:types            # Generate Cloudflare binding types (run after API changes)
bun typecheck             # Run TypeScript type checking
bun lint                  # Run Biome linter
bun lint:fix              # Fix linting issues
bun test                  # Run tests
bun test:watch            # Run tests in watch mode
```

### Database Management
```bash
bun db:generate           # Generate migration files from schema changes
bun db:push:local        # Apply migrations to local D1 database
bun db:push:remote       # Apply migrations to production D1 database
bun db:studio:local      # Open Drizzle Studio for local DB inspection
```

### Deployment
```bash
bun build                # Build client assets
bun env:push:remote      # Sync secrets to Cloudflare
bun deploy               # Deploy to Cloudflare Workers
```

## Architecture

### Directory Structure
- `src/server/` - Backend API routes, middleware, and database
  - `db/` - Drizzle schema and migrations
  - `lib/` - Core utilities and types
  - `middleware/` - Auth and other middleware
  - `routes/` - API endpoints with OpenAPI docs
- `src/components/` - React components
- `src/hooks/` - Custom React hooks and API client
- `src/routes/` - TanStack Router pages

### Key Concepts

1. **Unified Context Type**: All Hono routes use `BaseContext` from `src/server/lib/types.ts`
2. **Authentication**: Better Auth with Discord OAuth, JWT sessions (7-day expiry)
3. **Database**: Drizzle ORM with D1 (SQLite), schema in `src/server/db/schema.ts`
4. **API Documentation**: Auto-generated OpenAPI at `/doc`, Scalar UI at `/reference`
5. **Type Safety**: End-to-end types from database to frontend via generated types

### Environment Configuration

**Local Development** (`.dev.vars`):
```
ENVIRONMENT=development
BETTER_AUTH_SECRET=your-secret
DISCORD_CLIENT_ID=your-id
DISCORD_CLIENT_SECRET=your-secret
```

**Node Environment** (`.env.local`):
```
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-db-id
CLOUDFLARE_D1_TOKEN=your-token
```

### Testing

Tests use Vitest with Cloudflare Workers pool. Example pattern from `src/server/routes/tasks/tasks.test.ts`:
- Direct access to `env.DB` for database testing
- Full Cloudflare Workers environment emulation
- Test files alongside source code (`*.test.ts`)

### Important Notes

- **Always run `bun gen:types` after modifying wrangler.toml** to update TypeScript types
- **drizzle-zod locked to v0.7.1** due to Zod v4 incompatibility
- **Asset manifest** (`assets-manifest.json`) is auto-generated during build