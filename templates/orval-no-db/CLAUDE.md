# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinoflare v2 - A modern full-stack TypeScript application running on Cloudflare Workers with React frontend and Hono backend. This is the **NO-DB** version without database functionality.

**Tech Stack:**
- Backend: Hono on Cloudflare Workers
- Frontend: React with TanStack Router
- API Client: Orval (OpenAPI-based code generation)
- Styling: Tailwind CSS
- Build: Vite + Wrangler
- Testing: Vitest
- Code Quality: Biome (linting & formatting)

## Essential Commands

```bash
# Development
bun run dev          # Start dev server (http://localhost:5173)
bun run build        # Build for production
bun run deploy       # Deploy to Cloudflare Workers

# Code Generation
bun run gen:module <name>     # Generate new API module (handlers, routes, schemas, tests)
bun run gen:api              # Generate/update OpenAPI spec and client hooks
bun run gen:routes           # Update TanStack Router types

# Code Quality (IMPORTANT: Run these after implementing features)
bun run lint                 # Check code style
bun run lint:fix            # Auto-fix code style issues  
bun run typecheck           # Verify TypeScript types
bun test                    # Run all tests
bun test:watch             # Run tests in watch mode

# Utilities
bun run push:env            # Push local .dev.vars to GitHub secrets
```

## Project Structure

```
src/
├── client/                 # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Client utilities (query client, custom fetch)
│   ├── routes/           # TanStack Router pages
│   └── router.tsx        # Route configuration
├── server/                # Backend Hono application
│   ├── core/             # Core framework (APIBuilder, app factory)
│   ├── middleware/       # Global middleware (logging, error handling)
│   ├── modules/          # API modules (each with handlers, routes, schemas)
│   ├── routes/           # Additional routes (docs, health)
│   └── tests/            # Test utilities and setup
├── generated/             # Auto-generated files (OpenAPI client, route types)
└── utils/                 # Shared utilities
```

## Architecture Patterns

### Module System
Each module in `/src/server/modules/` follows a consistent structure:
- `index.ts` - Module definition with name, basePath, and createModule function
- `[module].handlers.ts` - Request handlers with business logic
- `[module].routes.ts` - APIBuilder route definitions
- `[module].schema.ts` - Zod schemas for validation and type generation
- `__tests__/[module].test.ts` - Module-specific tests

### APIBuilder Pattern
The APIBuilder provides a fluent API for defining routes with full type safety:

```typescript
const builder = new APIBuilder({ endpoint: "todos" });

builder
  .get("/", getTodosHandler)
  .query(getTodosQuerySchema)
  .summary("Get all todos")
  .response(200, { 
    schema: z.object({ todos: z.array(todoSchema) }),
    description: "List of todos"
  });

export const todoRoutes = builder.build();
```

### Handler Pattern
Handlers receive typed context and return JSON responses:

```typescript
export const getTodoHandler = async (c: Context<BaseContext>) => {
  const { id } = c.req.param();
  const todo = await getTodo(id);
  
  if (!todo) {
    throw new NotFoundError("Todo not found");
  }
  
  return c.json({ todo }, StatusCodes.OK);
};
```

### Schema-First Development
1. Define Zod schemas → 2. Generate types → 3. Generate OpenAPI → 4. Generate client hooks

```typescript
// Define schema
export const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  completed: z.boolean().default(false)
});

// Use in route
builder.post("/", createTodoHandler).body(createTodoSchema);

// Auto-generates client hook
const { mutate } = usePostTodo();
```

## Key Conventions

### Imports
- Use absolute imports with path aliases: `@/server/`, `@/client/`, `@/utils/`
- Import Zod as: `import { z } from "zod"` (not from subpath)
- Group imports: external → internal → types

### Response Format
Always wrap responses in objects for consistency:
```typescript
// ✅ Good
return c.json({ user }, 200);
return c.json({ users }, 200);
return c.json({ message: "Success" }, 200);

// ❌ Bad
return c.json(user, 200);
return c.json([user1, user2], 200);
```

### Error Handling
Use custom error classes from `@/server/core/error-handler`:
```typescript
throw new BadRequestError("Invalid input");
throw new NotFoundError("Resource not found");
throw new UnauthorizedError("Access denied");
```

### Testing
- Unit tests for handlers and utilities
- Integration tests for API endpoints
- Use test utilities from `@/server/tests/`
- Mock external dependencies

## Development Workflow

### Creating a New Module

1. Generate the module structure:
```bash
bun run gen:module blog
```

2. Define your schemas in `blog.schema.ts`

3. Implement handlers in `blog.handlers.ts`

4. Define routes in `blog.routes.ts` using APIBuilder

5. Update the module definition in `index.ts`

6. Generate API client:
```bash
bun run gen:api
```

7. Use generated hooks in frontend:
```typescript
import { useGetBlog, usePostBlog } from "@/generated/endpoints/blog/blog";
```

## Configuration Files

- **tsconfig.json** - TypeScript configuration with path aliases
- **vite.config.ts** - Build configuration for frontend and dev server
- **biome.json** - Linting and formatting rules
- **vitest.config.ts** - Test runner configuration
- **orval.config.ts** - OpenAPI client generation settings
- **wrangler.jsonc** - Cloudflare Workers deployment configuration

## Best Practices

### Type Safety
- Leverage Zod schemas for runtime validation and type generation
- Use typed context in handlers: `Context<BaseContext>`
- Avoid `any` types - use `unknown` and validate

### Error Handling
- Use custom error classes for different HTTP status codes
- Let the global error handler format responses
- Include helpful error messages for debugging

### Performance
- Keep handlers lightweight - this version has no database
- Use appropriate caching headers
- Minimize bundle size with tree-shaking

### Security
- Validate all inputs with Zod schemas
- Use environment variables for sensitive data
- This version has no authentication - all endpoints are public

### Code Quality
- Run `bun run lint` and `bun run typecheck` before committing
- Write tests for new functionality
- Follow the established module structure

## Environment Variables

Local development uses `.dev.vars`:
```bash
NODE_ENV=development
# Add other variables as needed
```

Production secrets are managed via Wrangler:
```bash
wrangler secret put KEY_NAME
```

## Troubleshooting

### Common Issues

1. **TypeScript errors after generating API**
   - Run `bun run gen:routes` to update router types
   - Restart TypeScript server in your editor

2. **Module not loading**
   - Ensure module is exported from `/src/server/modules/index.ts`
   - Check module definition follows the interface

3. **API client hooks not updating**
   - Run `bun run gen:api` after changing schemas/routes
   - Check the OpenAPI spec at `/api/docs`

4. **Build failures**
   - Clear `.cache` and `dist` directories
   - Run `bun install` to ensure dependencies are up to date

## Quick Reference

### File Naming
- Modules: `[name].handlers.ts`, `[name].routes.ts`, `[name].schema.ts`
- Components: PascalCase (`TodoList.tsx`)
- Hooks: `use-[name].ts`
- Utilities: kebab-case (`format-date.ts`)

### Common Imports
```typescript
import { z } from "zod";
import { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { APIBuilder } from "@/server/core/api-builder";
import type { BaseContext } from "@/server/lib/worker-types";
```

### Frequently Used Commands
```bash
bun run dev                  # Start development
bun run gen:module <name>    # Create new module
bun run gen:api             # Update API client
bun run lint:fix            # Fix code style
bun test                    # Run tests
```