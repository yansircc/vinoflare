# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 - Full-stack TypeScript application on Cloudflare Workers with React, Hono, D1 database, and Better Auth.

## Essential Commands

```bash
# Development
bun run dev                  # Start dev server (http://localhost:5173)
bun run build                # Build for production
bun run deploy               # Deploy to Cloudflare Workers

# Code Generation
bun run scaffold:module <name>  # Generate complete CRUD module
bun run gen:api              # Generate OpenAPI spec
bun run gen:client           # Generate RPC client types
bun run gen:routes           # Update TanStack Router types

# Database
bun run db:generate          # Generate migrations from schema changes
bun run db:push:local        # Apply migrations locally
bun run db:push:remote       # Apply migrations to production
bun run db:studio            # Open Drizzle Studio GUI
bun run db:reset:local       # Reset local database

# Quality Checks (IMPORTANT: Run after implementing features)
bun run lint                 # Check code style with Biome
bun run typecheck            # Verify TypeScript types
bun run test                 # Run Vitest tests (NOT bun test)
```

## Architecture Overview

### Module System
Each module in `/src/server/modules/` is self-contained with:
- `index.ts` - Module definition with name, basePath, and createModule function
- `[module].handlers.ts` - Business logic
- `[module].routes.ts` - APIBuilder REST routes with OpenAPI
- `[module].rpc.ts` - Optional Hono RPC routes for type-safe client
- `[module].table.ts` - Drizzle table schema
- `[module].schema.ts` - Zod validation schemas
- `__tests__/` - Module tests using Vitest

### Dual API Pattern
This codebase supports both REST and RPC APIs:

**REST Routes** (`.routes.ts`):
```typescript
const builder = new APIBuilder({ endpoint: "posts" });
builder
  .post("/", createPostHandler)
  .body(createPostSchema)
  .response(201, { schema: postResponseSchema });
export const postsRoutes = builder.build();
```

**RPC Routes** (`.rpc.ts`):
```typescript
const app = new Hono()
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const data = c.req.valid("json");
    const result = await createPost(c, data);
    return c.json(result.data);
  });
export type PostsRpcType = typeof app;
```

### Response Format Differences
- **REST**: Always wrap data and include status: `c.json({ post }, 201)`
- **RPC**: Return data directly: `c.json(result.data)`
- **Deletes**: REST returns 204, RPC returns deleted resource

### Database-First Workflow
1. Define/modify table in `[module].table.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:push:local` to apply
4. Schemas auto-generated via `drizzle-zod`
5. Run `bun run gen:client` for RPC types

## Key Conventions

### Imports
- Always use `import { z } from "zod/v4"` (not plain "zod")
- Use path aliases: `@/` for src, `@server/`, `@client/`
- Never use relative imports

### Module Structure
```typescript
// Module definition in index.ts
export default {
  name: "posts",
  basePath: "/posts",
  createModule: (app: Hono) => {
    app.route("/", postsRoutes);
    return app;
  },
  tables: { posts: postsTable }
} satisfies ModuleDefinition;
```

### Database Access
```typescript
const db = c.get("db");  // Get database from context (injected by middleware)
const posts = await db.query.posts.findMany({
  where: eq(posts.authorId, userId)
});
```

### Error Handling
- Use `APIError` class for custom errors with statusCode
- Global error handler formats all errors consistently
- Validation errors automatically handled via `zValidator`

### Testing Pattern
```typescript
// Use test utilities
const testApp = createTestApp();
const authRequest = await createAuthRequest(testApp);

// Test authenticated endpoints
const response = await testApp.request("/api/posts", {
  ...authRequest,
  method: "POST",
  body: JSON.stringify(data)
});
```

## Development Workflow

### Creating a New Module
```bash
bun run scaffold:module <name>  # Generate complete module structure
bun run db:generate             # Create migration from schema
bun run db:push:local           # Apply migration
bun run gen:client              # Update RPC client types
```

### Important Notes
- **API Docs**: Available at `/api/docs` (Scalar UI)
- **Auth**: Discord OAuth required, redirect URL: `http://localhost:5173/api/auth/callback/discord`
- **Client Generation**: RPC client at `/src/generated/rpc-client.ts`
- **Middleware**: Core middleware exported from `/server/middleware/index.ts`
- **Environment**: Local config in `.dev.vars`, production via `wrangler secret put`
- **Test Command**: Use `bun run test` NOT `bun test` for Cloudflare Workers environment