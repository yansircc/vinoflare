# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 - Full-stack TypeScript application built on Cloudflare Workers with React, Hono, D1 database, Better Auth, and Orval for type-safe API client generation.

## Essential Commands

```bash
# Development
bun run dev                  # Start dev server (http://localhost:5173)
bun run build                # Build for production (client + server)
bun run deploy               # Deploy to Cloudflare Workers

# Code Generation
bun run gen:module <name>    # Generate complete CRUD module with tests
bun run gen:api              # Generate OpenAPI spec + Orval client hooks
bun run gen:routes           # Update TanStack Router types
bun run gen:types            # Generate Cloudflare binding types

# Database Management
bun run db:generate          # Generate migrations from schema changes
bun run db:push:local        # Apply migrations to local D1
bun run db:push:remote       # Apply migrations to production D1
bun run db:reset:local       # Reset local database (deletes all data)
bun run db:studio            # Open Drizzle Studio GUI

# Quality & Testing
bun run typecheck            # Check TypeScript types
bun run lint                 # Run Biome linter
bun run lint:fix             # Fix lint issues + format code
bun test                     # Run Vitest tests

# Environment & Secrets
bun run env:push:cf          # Push secrets to Cloudflare
bun run env:push:gh          # Push secrets to GitHub Actions
```

## Architecture Overview

### Module-Based Backend Architecture
Each module in `/src/server/modules/` is self-contained with standardized structure:
- `index.ts` - Module definition exporting name, basePath, createModule, and tables
- `[module].handlers.ts` - Business logic implementing route handlers
- `[module].routes.ts` - APIBuilder route definitions with OpenAPI metadata
- `[module].table.ts` - Drizzle ORM table schema
- `[module].schema.ts` - Zod validation schemas (request/response)
- `__tests__/[module].test.ts` - Module-specific tests using Vitest

### APIBuilder Pattern
Custom API building framework that provides type safety and OpenAPI generation:
```typescript
const builder = new APIBuilder({ endpoint: "todos" });

builder
  .post("/", createTodoHandler)
  .body(createTodoSchema)           // Zod schema for validation
  .summary("Create a new todo")
  .response(201, { schema: todoResponseSchema })
  .response(400, { schema: errorSchema });

export const todoRoutes = builder.getApp();
```

### Type-Safe Data Flow
```
D1 Table (Drizzle) → Zod Schema → TypeScript Type → OpenAPI Spec → Orval Client Hooks
```

This ensures end-to-end type safety from database to frontend components.

## Key Architectural Patterns

### 1. Edge-First Design
- Optimized for Cloudflare Workers edge runtime
- D1 SQLite database for edge-native persistence
- Minimal cold starts with efficient bundling

### 2. Middleware Stack
Applied in order via `src/server/middleware/index.ts`:
1. **CORS** - Cross-origin resource sharing
2. **Trailing Slash** - URL normalization
3. **Database** - Injects D1 connection into context
4. **JSON Logger** - Structured logging (production only)
5. **Auth Guard** - Protects all `/api/*` routes by default

### 3. Authentication System
- Better Auth with Discord OAuth provider
- JWT-based authentication with Bearer tokens
- Session management (7-day expiration)
- Rate limiting on auth endpoints
- Redirect URL: `http://localhost:5173/api/auth/callback/discord`

### 4. Frontend Architecture
- React 19 with TanStack Router for type-safe routing
- TanStack Query for server state management
- Orval-generated hooks for API calls
- Tailwind CSS with Vite plugin for styling
- Custom fetch wrapper with auth token injection

### 5. Testing Strategy
- Vitest with Cloudflare Workers pool for edge-compatible tests
- Module-level test organization
- Test utilities for auth mocking
- Database reset capabilities for test isolation

## Development Workflow

### Creating a New Feature Module
```bash
# 1. Generate module scaffolding
bun run gen:module posts

# 2. Implement business logic in posts.handlers.ts

# 3. Generate database migration
bun run db:generate

# 4. Apply migration locally
bun run db:push:local

# 5. Generate updated API client
bun run gen:api

# 6. Use generated hooks in frontend components
```

### Module Implementation Guidelines

1. **Response Format**: Always wrap data in objects
   ```typescript
   // ✅ Correct
   return c.json({ post }, 200);
   return c.json({ posts }, 200);
   
   // ❌ Incorrect
   return c.json(post, 200);
   ```

2. **Database Access**: Get from context
   ```typescript
   const db = c.get("db");
   const result = await db.query.posts.findMany({
     where: eq(posts.userId, user.id)
   });
   ```

3. **Error Handling**: Use HTTPException
   ```typescript
   import { HTTPException } from "hono/http-exception";
   
   throw new HTTPException(404, { message: "Post not found" });
   ```

4. **Import Conventions**:
   - Use `import { z } from "zod/v4"` (not plain "zod")
   - Use path aliases: `@/` for src, `@/server/`, `@/client/`
   - Never use relative imports

### Frontend Development

1. **API Integration**: Use Orval-generated hooks
   ```typescript
   import { useGetTodos, useCreateTodo } from "@/generated/endpoints/todo/todo";
   
   const { data, isLoading } = useGetTodos();
   const createMutation = useCreateTodo();
   ```

2. **Authentication**: Access auth state
   ```typescript
   import { useAuth } from "@/client/lib/auth";
   
   const { session, user } = useAuth();
   ```

3. **Error Handling**: Use error boundaries and toast notifications
   ```typescript
   import { toast } from "sonner";
   
   toast.error("Failed to create todo");
   ```

## Environment Configuration

### Local Development
- Configuration in `.dev.vars` (git-ignored)
- Copy `.dev.vars.example` to get started
- Required: Discord OAuth credentials

### Production Deployment
- Secrets via `wrangler secret put` or `bun run env:push:cf`
- Database: D1 binding named `DB`
- Environment variables accessed via `c.env`

## Important Implementation Notes

1. **Module Loading**: Modules are auto-discovered by `module-loader.ts`
2. **API Documentation**: Available at `/api/docs` using Scalar UI
3. **OpenAPI Spec**: Generated at `/api/openapi.json`
4. **Database GUI**: Use `bun run db:studio` for visual database management
5. **Build Process**: Two-phase build - client assets first, then server bundle
6. **Type Generation**: Run `gen:api` after any API changes
7. **Testing**: Uses Cloudflare Workers test environment for edge compatibility

## Common Pitfalls to Avoid

1. Don't import from "zod" directly - use "zod/v4"
2. Don't return raw data - always wrap in objects
3. Don't use relative imports - use path aliases
4. Don't forget to run `gen:api` after API changes
5. Don't expose sensitive data in responses
6. Don't skip response schema definitions in routes