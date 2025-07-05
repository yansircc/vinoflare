# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 RPC Branch - A full-stack TypeScript application built on Cloudflare Workers with React frontend, Hono backend, and RPC-style API communication. This variant includes no authentication and no database (in-memory storage only).

## Essential Commands

### Development
```bash
# Start development server (http://localhost:5173)
bun run dev

# Build for production
bun run build

# Deploy to Cloudflare Workers
bun run deploy

# Type checking
bun run typecheck

# Code quality
bun run lint         # Check code issues
bun run lint:fix     # Auto-fix code issues
bun run format       # Format code

# Testing
bun run test         # Run tests with Vitest
```

### Code Generation
```bash
# Generate new CRUD module (recommended workflow)
bun run gen:module <name>

# Generate RPC client from server routes
bun run gen:client

# Generate OpenAPI specification
bun run gen:api

# Generate TanStack Router types
bun run gen:routes

# Generate Cloudflare types
bun run gen:types
```

### Environment Management
```bash
# Push secrets to Cloudflare
bun run env:push:cf

# Push env to GitHub
bun run env:push:gh
```

## Architecture

### Full-Stack Structure
- **Frontend**: React 19 with TanStack Router, TailwindCSS, React Query
- **Backend**: Hono framework on Cloudflare Workers
- **API Pattern**: Hono RPC for type-safe client-server communication
- **Storage**: In-memory Maps (no database)
- **Auth**: None (all routes public)

### Module System
Each module in `/src/server/modules/` contains:
- `index.ts` - Module definition with metadata
- `[module].handlers.ts` - Business logic with in-memory storage
- `[module].routes.ts` - APIBuilder route definitions (for OpenAPI)
- `[module].rpc.ts` - RPC-compatible Hono routes
- `[module].schema.ts` - Zod validation schemas
- `__tests__/` - Module tests

### RPC Pattern Implementation
```typescript
// Server: Define RPC routes in [module].rpc.ts
export const helloRpcRoutes = new Hono<BaseContext>()
  .get("/", helloHandler)
  .post("/", zValidator("json", createSchema), createHandler);

// Client: Auto-generated type-safe client
import { apiClient } from "@/generated/rpc-client";
const response = await apiClient.hello.$get();
const data = await response.json();
```

### Key Design Patterns

1. **In-Memory Storage Pattern**
```typescript
// In handlers.ts
const items = new Map<number, Item>();
let nextId = 1;

export const getAllItems = async (_c: SimpleContext) => {
  const itemList = Array.from(items.values());
  return { data: { items: itemList }, status: 200 };
};
```

2. **Response Format**
Always wrap data in objects:
- Single item: `{ item: Item }`
- Multiple items: `{ items: Item[] }`
- Never return bare arrays or primitives

3. **No Authentication**
- All routes are public
- No auth middleware
- No user context

4. **Module Registration**
```typescript
// In module index.ts
export default {
  name: "hello",
  basePath: "/hello",
  createModule: (app: Hono) => {
    app.route("/", helloRoutes);    // For OpenAPI
    return app;
  },
} satisfies ModuleDefinition;
```

## Development Workflow

### Creating a New Module
1. Generate module skeleton:
   ```bash
   bun run gen:module products
   ```

2. Implement handlers with in-memory storage in `products.handlers.ts`

3. Define RPC routes in `products.rpc.ts`

4. Generate client types:
   ```bash
   bun run gen:client
   ```

5. Use in React components:
   ```typescript
   import { apiClient } from "@/generated/rpc-client";
   
   const { data } = await apiClient.products.$get();
   ```

### Testing
Tests use Vitest with Cloudflare Workers pool:
```bash
# Run all tests
bun run test

# Run specific test file
bun run test src/server/modules/hello/__tests__/hello.test.ts

# Run tests in watch mode
bun run test --watch
```

### Local Development
1. Create `.dev.vars` for local environment variables
2. Start dev server: `bun run dev`
3. API available at `http://localhost:5173/api`
4. API docs at `http://localhost:5173/api/docs`

## Important Conventions

### Import Paths
- Use path aliases: `@/`, `@/server/`, `@/client/`
- Never use relative imports
- Import zod as: `import { z } from "zod/v4"`

### File Naming
- Modules: `[name]/[name].handlers.ts`, `[name]/[name].rpc.ts`, etc.
- Tests: `__tests__/[name].test.ts`
- Schemas: `[name].schema.ts`

### Error Handling
- Use `HTTPException` from Hono for standard HTTP errors
- Global error handler ensures consistent format
- All errors return JSON with `error` and `message` fields

### Code Generation
The RPC client generator (`scripts/generate-rpc-client.ts`):
- Scans all `*.rpc.ts` files
- Generates a standalone client in `src/generated/rpc-client.ts`
- No manual type exports needed
- Provides full type safety from server to client

## Deployment

### Build Process
1. Client build: `vite build --mode client`
2. Server build: `vite build`
3. Assets served via ASSETS binding

### Deploy to Cloudflare
```bash
bun run build
bun run deploy
```

### Environment Variables
- Local: `.dev.vars` file
- Production: `wrangler secret put <KEY>`
- No database configuration needed