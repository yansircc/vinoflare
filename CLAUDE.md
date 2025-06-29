# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vinoflare v2 application - a full-stack TypeScript application running on Cloudflare Workers with React frontend, Hono backend, and D1 database.

## Essential Commands

### Development
```bash
bun run dev          # Start development server (http://localhost:5173)
bun run build        # Build both client and server
bun run typecheck    # Run TypeScript type checking
```

### Code Generation
```bash
bun run gen:api      # Generate OpenAPI spec and Orval client hooks
bun run gen:routes   # Generate TanStack Router types
bun run gen:types    # Generate Cloudflare binding types
bun run gen:module <name>  # Generate complete CRUD module
bun run gen:module <name> --schema-name <schema>  # Custom schema name
```

### Database
```bash
bun run db:generate  # Generate Drizzle migrations
bun run db:push:local   # Apply migrations to local D1
bun run db:push:remote  # Apply migrations to remote D1 (production)
bun run db:studio    # Open Drizzle Studio (creates db.sqlite symlink)
bun run db:reset:local  # Reset local database (deletes all data!)
bun run db:reset:remote # Reset remote database (deletes all data! - with warning)
```

### Testing & Quality
```bash
bun test            # Run all tests
bun test <file>     # Run specific test file
bun run lint        # Run Biome linter
bun run lint:fix    # Fix linting and formatting issues
```

## Architecture Overview

### Module System
The application uses a modular architecture. Each module in `/src/server/modules/` contains:
- `index.ts` - Module definition exporting routes and metadata
- `[module].handlers.ts` - Request handlers
- `[module].routes.ts` - Route definitions using APIBuilder
- `[module].openapi.ts` - OpenAPI schema definitions
- `[module].test.ts` - Module tests

### Schema Flow
1. Database tables defined in `/src/server/db/tables/`
2. Zod schemas generated in `/src/server/schemas/database/`
3. Types exported from `/src/server/types/`
4. OpenAPI schemas reference Zod schemas
5. Orval generates typed client hooks from OpenAPI

### Authentication
- Uses Better Auth with Discord OAuth (no email/password)
- Default behavior: all routes protected unless in PUBLIC_API_ROUTES
- Auth state available via `c.get("user")` and `c.get("session")`

### API Response Pattern
All API responses follow this pattern:
```typescript
// Success
{ data: T }  // e.g., { post: Post } or { posts: Post[] }

// Error (handled by global error handler)
{ error: { code: string, message: string, timestamp: string, path: string } }
```

## Key Architectural Decisions

### Zod v4 Requirement
The project uses Zod v4 via subpath import (`zod/v4`) to avoid breaking changes. Always import as:
```typescript
import { z } from "zod/v4";
```

### Database Schema as Source of Truth
- Database schemas drive type generation
- Use `drizzle-zod` to generate validation schemas
- Dates in schemas must use `.iso.datetime({ offset: true })` for JSON Schema compatibility

### Module Registration
Modules are automatically registered if they export a valid `ModuleDefinition`:
```typescript
export default {
  name: "posts",
  routes: createPostsRoutes(),
  openapi: postsOpenAPI,
} satisfies ModuleDefinition;
```

### Error Handling
- Use `HTTPException` from Hono for standard HTTP errors
- Custom errors extend `APIError` class
- Global error handler converts all errors to consistent format

## Common Patterns

### Creating New API Endpoints
Use the APIBuilder pattern for consistency:
```typescript
const builder = new APIBuilder({ endpoint: "posts" });

builder
  .get("/:id", getPostByIdHandler)
  .input(z.object({ id: z.coerce.number() }), "params")
  .openapi(getPostByIdOpenAPI);
```

### Working with Database
Access database via middleware:
```typescript
const db = c.get("db");
const posts = await db.query.posts.findMany();
```

### Type Imports
- Database types: `import type { SelectPost } from "@/server/types"`
- API types: Generated in `/src/generated/`
- Schemas: `import { selectPostSchema } from "@/server/schemas"`

## Development Workflow

### Adding a New Feature
1. Create database table in `/src/server/db/tables/`
2. Run `bun run db:generate` to create migration
3. Run `bun run scaffold:module <name>` to generate module
4. Implement business logic in handlers
5. Run `bun run gen:api` to update client types
6. Use generated hooks in React components

### Local Database Access
The D1 database file has a hash-based name. Use:
```bash
bun run db:studio  # Automatically creates db.sqlite symlink
```

### Testing API Endpoints
- OpenAPI documentation available at `/api/docs`
- Use the interactive Scalar UI to test endpoints
- Auth endpoints require Discord OAuth setup

## Important Conventions

### Import Paths
- `@/` - Root src directory
- `@/server/` - Server-side code
- `@/client/` - Client-side code

### File Naming
- Handlers: `[module].handlers.ts`
- Routes: `[module].routes.ts`
- OpenAPI: `[module].openapi.ts`
- Tests: `[module].test.ts`

### Response Wrapping
All API responses wrap data in an object:
```typescript
// Correct
return c.json({ post }, 200);

// Incorrect
return c.json(post, 200);
```

### Date Handling
- Database stores timestamps as integers
- API returns ISO strings
- Use `.datetime({ offset: true })` in Zod schemas for OpenAPI compatibility