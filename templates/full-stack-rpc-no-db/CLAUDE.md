# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 RPC Branch - Full-stack TypeScript app on Cloudflare Workers with React, Hono, and RPC-style API without authentication or database.

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
bun run gen:client           # Generate RPC client

# Quality Checks (IMPORTANT: Run after implementing features)
bun run lint                 # Check code style
bun run typecheck            # Verify TypeScript types
bun test                     # Run tests
```

## Architecture Overview

### Module System
Each module in `/src/server/modules/` is self-contained with:
- `index.ts` - Module definition with name, basePath, and createModule function
- `[module].handlers.ts` - Business logic (uses in-memory storage)
- `[module].routes.ts` - APIBuilder route definitions
- `[module].rpc.ts` - RPC-compatible Hono routes
- `[module].schema.ts` - Zod validation schemas

### RPC Pattern
```typescript
// RPC routes in [module].rpc.ts
export const todoRpcRoutes = new Hono<BaseContext>()
  .get("/", async (c) => {
    const result = await getAllTodo(c);
    return c.json(result.data);
  })
  .post("/", zValidator("json", insertTodoSchema), async (c) => {
    const result = await createTodo(c, {
      body: c.req.valid("json"),
    });
    return c.json(result.data);
  });
```

### Key Patterns
- **No Database**: In-memory storage for simplicity
- **No Auth**: All routes are public
- **RPC Client**: Type-safe client generated from server routes
- **Responses**: Always wrap data in objects: `{ todo: Todo }` or `{ todos: Todo[] }`
- **Errors**: Global handler ensures consistent error format

## Key Conventions

### Imports
- Always use `import { z } from "zod/v4"` (not plain "zod")
- Use path aliases: `@/` for src, `@/server/`, `@/client/`
- Never use relative imports

### Module Structure
```typescript
// Module definition in index.ts
export default {
  name: "todos",
  basePath: "/todos",
  createModule: (app: Hono) => {
    app.route("/", todosRoutes);
    return app;
  },
} satisfies ModuleDefinition;
```

### In-Memory Storage
```typescript
// In handlers.ts
const todos = new Map<number, SelectTodo>();
let nextId = 1;

export const getAllTodo = async (_c: SimpleContext) => {
  const todoList = Array.from(todos.values());
  return { data: { todos: todoList }, status: 200 };
};
```

## Development Workflow

### Creating a New Module
```bash
bun run gen:module <name>    # Generate module skeleton
bun run gen:api              # Update OpenAPI spec
bun run gen:client           # Update RPC client types
```

### Important Notes
- **API Docs**: Available at `/api/docs` (Scalar UI)
- **No Database**: All data is stored in memory and resets on restart
- **No Auth**: All routes are publicly accessible
- **Response Format**: Always wrap data in objects: `return c.json({ post }, 200)`
- **Environment**: Local config in `.dev.vars`, production via `wrangler secret put`

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.