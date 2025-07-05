# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 (rpc-no-auth branch) - A modern full-stack TypeScript application built on Cloudflare Workers with React, Hono, D1 database, and Hono RPC client. This branch specifically removes authentication for public API use cases.

## Essential Commands

```bash
# Development
bun run dev                  # Start dev server (http://localhost:5173)
bun run build                # Build for production
bun run deploy               # Deploy to Cloudflare Workers

# Code Generation
bun run scaffold:module <name>  # Generate complete CRUD module with RPC
bun run gen:api              # Generate OpenAPI spec
bun run gen:client           # Generate RPC client types
bun run gen:routes           # Update TanStack Router types

# Database
bun run db:generate          # Generate migrations from schema changes
bun run db:push:local        # Apply migrations locally
bun run db:push:remote       # Apply migrations to production
bun run db:studio            # Open Drizzle Studio GUI

# Quality Checks (IMPORTANT: Run these after implementing features)
bun run lint                 # Check code style with Biome
bun run lint:fix             # Auto-fix code issues
bun run typecheck            # Verify TypeScript types
bun run test                 # Run Vitest tests (NOT bun test)
```

## Architecture Overview

### RPC-First Architecture (No Auth)
This project uses Hono RPC for type-safe client-server communication without authentication:

1. **Dual Route System**: Each module has both REST routes (`.routes.ts`) for OpenAPI docs and RPC routes (`.rpc.ts`) for type-safe client
2. **Auto-generated Client**: Running `bun run gen:client` scans all `.rpc.ts` files and generates a unified type-safe client
3. **No Authentication**: All endpoints are public, no auth middleware or user context

### Module System
Each module in `/src/server/modules/` contains:
- `index.ts` - Module definition with name, basePath, and tables
- `[module].handlers.ts` - Business logic implementation
- `[module].routes.ts` - APIBuilder REST routes with OpenAPI
- `[module].rpc.ts` - Hono RPC routes for type-safe client
- `[module].table.ts` - Drizzle ORM table schema
- `[module].schema.ts` - Zod validation schemas
- `__tests__/` - Module tests

### Project Structure
```
src/
├── client/               # React frontend
│   ├── hooks/           # Custom hooks using RPC client
│   └── routes/          # TanStack Router pages
├── server/              # Hono backend
│   ├── core/            # Core utilities (APIBuilder, module loader)
│   ├── db/              # Database configuration and migrations
│   ├── modules/         # Feature modules
│   └── middleware/      # Database and logging middleware
└── generated/           # Auto-generated files
    └── rpc-client.ts    # Type-safe RPC client
```

## Key Implementation Patterns

### RPC Route Definition
```typescript
// In [module].rpc.ts
export const todoRpcRoutes = new Hono<BaseContext>()
  .post("/", zValidator("json", createTodoSchema), async (c) => {
    const result = await createTodo(c, { body: c.req.valid("json") });
    return c.json(result.data); // RPC returns data directly
  })
  .delete("/:id", async (c) => {
    const result = await deleteTodo(c, { params: { id: c.req.param("id") } });
    return c.json(result.data); // RPC returns deleted resource
  });

export type TodoRpcType = typeof todoRpcRoutes;
```

### Client Usage
```typescript
import { apiClient } from "@/generated/rpc-client";

// Type-safe API calls
const res = await apiClient.todo.$post({
  json: { title: "New Task", completed: false }
});

if (res.ok) {
  const todo = await res.json(); // Fully typed
}
```

### Module Registration
```typescript
// In module index.ts
export default {
  name: "todo",
  basePath: "/todo",
  createModule: (app: Hono) => {
    app.route("/", todoRoutes);      // REST routes
    app.route("/", todoRpcRoutes);   // RPC routes (same path)
    return app;
  },
  tables: { todos: todosTable }
} satisfies ModuleDefinition;
```

## Important Conventions

### Response Format Differences
- **REST**: Always wrap responses: `c.json({ todo }, 201)`
- **RPC**: Return data directly: `c.json(result.data)`
- **DELETE**: REST returns 204, RPC returns deleted resource

### Database Context
```typescript
// Get database from context (injected by middleware)
const db = c.get("db");
const todos = await db.query.todos.findMany(); // No user filtering
```

### Error Handling
- Use `APIError` for custom errors with status codes
- Global error handler ensures consistent format
- No authentication errors in this branch

### Testing
```typescript
// Use test utilities
const testApp = createTestApp();

// Test public endpoints directly
const response = await testApp.request("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});
```

## Development Workflow

### Creating a New Module
```bash
bun run scaffold:module products  # Generate complete module
bun run db:generate              # Create migration
bun run db:push:local            # Apply migration
bun run gen:client               # Update RPC client types
```

### Common Development Flow
1. Modify handlers in `[module].handlers.ts`
2. Update RPC routes in `[module].rpc.ts`
3. Run `bun run gen:client` to regenerate types
4. Use updated `apiClient` in frontend
5. Run quality checks: `bun run lint && bun run typecheck && bun run test`

## Important Notes

- **Test Command**: Always use `bun run test` NOT `bun test` for proper Cloudflare Workers environment
- **API Docs**: Available at `/api/docs` with interactive Scalar UI
- **RPC Client**: Auto-generated at `/src/generated/rpc-client.ts`
- **No Auth**: All endpoints are public - no user context or auth middleware
- **Module Discovery**: RPC client generation automatically finds all `.rpc.ts` files
- **Type Source**: Database schemas (Drizzle) are the single source of truth for types