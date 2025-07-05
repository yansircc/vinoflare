# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 - Full-stack TypeScript application on Cloudflare Workers with React, Hono, and D1 database. This is the NO-AUTH version with all authentication removed - all API endpoints are publicly accessible.

## Essential Commands

```bash
# Development
bun run dev          # Start dev server (http://localhost:5173)
bun run build        # Build for production
bun run deploy       # Deploy to Cloudflare Workers

# Code Generation
bun run gen:module <name>     # Generate complete CRUD module
bun run gen:api              # Update OpenAPI spec and client hooks
bun run gen:routes           # Update TanStack Router types

# Database
bun run db:generate          # Generate migrations from schema changes
bun run db:push:local        # Apply migrations locally
bun run db:push:remote       # Apply migrations to production
bun run db:studio            # Open Drizzle Studio GUI

# Quality Checks (IMPORTANT: Run after implementing features)
bun run lint                 # Check code style
bun run lint:fix             # Fix code style issues
bun run typecheck            # Verify TypeScript types
bun test                     # Run tests (Vitest with Cloudflare Workers pool)
```

## Architecture Overview

### Module System
Each module in `/src/server/modules/` is self-contained with:
- `index.ts` - Module definition with name, basePath, and createModule function
- `[module].handlers.ts` - Business logic
- `[module].routes.ts` - APIBuilder route definitions
- `[module].table.ts` - Drizzle table schema
- `[module].schema.ts` - Zod validation schemas
- `__tests__/` - Module-specific tests

### APIBuilder Pattern
```typescript
const builder = new APIBuilder({ middleware: [database()] });

builder
  .post("/", createPostHandler)
  .body(createPostSchema)
  .summary("Create a new post")
  .response(201, { schema: postResponseSchema });

export const postsRoutes = builder.build();
```

### Key Patterns
- **Database-first**: Tables → Zod schemas → Types → OpenAPI → Client hooks
- **No Authentication**: All API routes are publicly accessible
- **Responses**: Always wrap data in objects: `{ post: Post }` or `{ posts: Post[] }`
- **Errors**: Global handler ensures consistent error format

## Key Conventions

### Imports
- Always use `import { z } from "zod"` (not "zod/v4")
- Use path aliases: `@/` for src, `@/server/`, `@/client/`
- Never use relative imports

### Module Structure
```typescript
// Module definition in index.ts
const todoModule: ModuleDefinition = {
  name: "todo",
  basePath: "/todo",
  createModule: createTodoModule,
  metadata: {
    version: "1.0.0",
    tags: ["Todo"],
  },
  tables: { todo }
};

export default todoModule;
```

### Database Access
```typescript
const db = c.get("db");  // Get database from context
const posts = await db.query.posts.findMany();
```

## Testing Approach

Tests use Vitest with Cloudflare Workers pool for realistic edge environment testing:
- Setup file at `src/server/tests/setup.ts`
- Test database migrations are applied automatically
- Use `vitest` (not `bun test`) for Cloudflare Workers compatibility
- Mock authentication tokens are pre-configured in test environment

## Development Workflow

### Creating a New Module
```bash
bun run gen:module <name>    # Generate complete CRUD module
bun run db:generate          # Create migration
bun run db:push:local        # Apply migration
bun run gen:api              # Update client types
```

### API Client Generation Flow
1. Backend routes define OpenAPI specs via APIBuilder
2. `gen:api` script generates OpenAPI JSON
3. Orval generates typed React Query hooks in `/src/generated/endpoints/`
4. Hooks use custom Axios instance with base URL configuration

### Environment Configuration
- Local: `.dev.vars` file (git-ignored)
- Production: `wrangler secret put` or `.prod.vars` with `bun run env:push:cf`
- Test: Configured in `vitest.config.ts`

## Important Notes

- **API Docs**: Available at `/api/docs` (Scalar UI)
- **No Authentication**: All API endpoints are publicly accessible
- **Database GUI**: Run `bun run db:studio` to open Drizzle Studio
- **Response Format**: Always wrap data in objects: `return c.json({ post }, 200)`
- **Error Handling**: Use HTTPException from Hono for standard errors
- **Type Safety**: Let database schemas drive your types through drizzle-zod