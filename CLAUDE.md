# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 API (No Auth No DB) - API-only version built on Cloudflare Workers with Hono. No authentication or database required.

## Essential Commands

```bash
# Development
bun run dev          # Start dev server (http://localhost:5173)
bun run build        # Build for production
bun run deploy       # Deploy to Cloudflare Workers

# Code Generation
bun run gen:module <name>     # Generate complete CRUD module
bun run gen:api              # Update OpenAPI spec

# No database commands in this version

# Quality Checks (IMPORTANT: Run after implementing features)
bun run lint                 # Check code style
bun run typecheck            # Verify TypeScript types
bun test                     # Run tests
```

## Architecture Overview

### Module System
Each module in `/src/server/modules/` is self-contained with:
- `index.ts` - Module definition with name, basePath, and createModule function
- `[module].handlers.ts` - Business logic (stateless)
- `[module].routes.ts` - APIBuilder route definitions
- `[module].schema.ts` - Zod validation schemas

### APIBuilder Pattern
```typescript
const builder = new APIBuilder({ endpoint: "posts" });

builder
  .post("/", createPostHandler)
  .body(createPostSchema)
  .summary("Create a new post")
  .response(201, { schema: postResponseSchema });

export const postsRoutes = builder.build();
```

### Key Patterns
- **API-first**: Zod schemas → Types → OpenAPI
- **No Authentication**: All API endpoints are publicly accessible
- **No Database**: Stateless API endpoints only
- **Responses**: Always wrap data in objects: `{ data: Data }` or `{ items: Item[] }`
- **Errors**: Global handler ensures consistent error format

## Key Conventions

### Imports
- Always use `import { z } from "zod/v4"` (not plain "zod")
- Use path aliases: `@/` for src, `@/server/`
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
  }
} satisfies ModuleDefinition;
```

### Stateless Handlers
```typescript
// Handlers are pure functions that don't persist data
export const handler = async (c: Context<BaseContext>) => {
  return c.json({ message: "Hello!" }, StatusCodes.OK);
};
```

## API Endpoints

### Default Routes
- `/` - Redirects to `/api/docs`
- `/api/docs` - Interactive API documentation (Scalar UI)
- `/api/openapi.json` - OpenAPI specification
- `/api/health` - Health check endpoint
- `/*` - Returns 404 with JSON error

### Public Access
- All API endpoints are publicly accessible
- No authentication or authorization required
- Suitable for public APIs or internal services

## Development Workflow

### Creating a New Module
```bash
bun run gen:module <name>    # Generate stateless module
bun run gen:api              # Update OpenAPI spec
```

### Important Notes
- **Entry Point**: `src/index.ts` exports Cloudflare Workers handler
- **Build Output**: Vite builds to `dist/` directory
- **Dev Server**: Uses Vite with Cloudflare plugin on port 5173
- **Response Format**: Always wrap data in objects: `return c.json({ post }, 200)`
- **No Auth**: No authentication middleware or user context

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.