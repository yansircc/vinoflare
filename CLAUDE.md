# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vinoflare v2 application - a full-stack TypeScript application running on Cloudflare Workers with React frontend, Hono backend, and D1 database. The codebase includes Chinese documentation in README.md and some modules.

## Essential Commands

### Development
```bash
bun run dev          # Start development server (http://localhost:5173)
bun run build        # Build both client and server
bun run typecheck    # Run TypeScript type checking
bun run format       # Format code with Biome
```

### Code Generation
```bash
bun run gen:api      # Generate OpenAPI spec and Orval client hooks
bun run gen:routes   # Generate TanStack Router types
bun run gen:types    # Generate Cloudflare binding types
bun run gen:module <name>  # Generate complete CRUD module
bun run gen:module <name> --schema-name <schema>  # Custom schema name
bun run scaffold:module <name>  # Alias for gen:module
```

### Database
```bash
bun run db:generate     # Generate Drizzle migrations
bun run db:push:local   # Apply migrations to local D1
bun run db:push:remote  # Apply migrations to remote D1 (production)
bun run db:studio       # Open Drizzle Studio (creates db.sqlite symlink)
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

### Deployment & Environment
```bash
bun run env:push:cf  # Push secrets to Cloudflare
bun run env:push:gh  # Push secrets to GitHub
```

## Architecture Overview

### Module System
The application uses a sophisticated modular architecture. Each module in `/src/server/modules/` contains:
- `index.ts` - Module definition exporting routes, tables, and metadata
- `[module].handlers.ts` - Request handlers with business logic
- `[module].routes.ts` - Route definitions using APIBuilder
- `[module].openapi.ts` - OpenAPI schema definitions
- `[module].schema.ts` - Zod validation schemas
- `[module].table.ts` - Drizzle table definition (if module has database)
- `[module].test.ts` - Module-specific tests

Modules are auto-discovered at runtime via import.meta.glob and dynamically registered.

### APIBuilder Pattern
The core architectural pattern for defining routes:
```typescript
const builder = new APIBuilder({ endpoint: "posts" });

// Chain methods for complete route definition
builder
  .post("/", createPostHandler)
  .body(createPostSchema)
  .summary("Create a new post")
  .description("Creates a post with the provided data")
  .response(201, { description: "Created", schema: postResponseSchema })
  .response(400, { description: "Validation error" });
```

Benefits:
- Type-safe route definitions with automatic validation
- Chainable API for all route metadata
- Automatic OpenAPI documentation generation
- Built-in error handling and response formatting

### Schema Flow
1. Database tables defined in `/src/server/db/tables/` or module's `[module].table.ts`
2. Zod schemas generated in `/src/server/schemas/database/` via drizzle-zod
3. Types exported from `/src/server/types/`
4. OpenAPI schemas reference Zod schemas for single source of truth
5. Orval generates typed client hooks from OpenAPI spec

### Authentication
- Uses Better Auth with Discord OAuth (no email/password by default)
- Default behavior: all routes protected unless in PUBLIC_API_ROUTES
- Auth state available via `c.get("user")` and `c.get("session")`
- Discord redirect URL: `http://localhost:5173/api/auth/callback/discord`
- Sessions expire after 7 days by default

### API Response Pattern
All API responses follow this pattern:
```typescript
// Success - always wrap data in an object
{ post: Post }           // Single item
{ posts: Post[] }        // Array of items
{ data: T }             // Generic data

// Error (handled by global error handler)
{ 
  error: { 
    code: string,        // ERROR_CODE format
    message: string,     // Human readable
    timestamp: string,   // ISO timestamp
    path: string,        // Request path
    details?: any        // Only in non-production
  }
}
```

## Key Architectural Decisions

### Zod v4 Requirement
The project uses Zod v4 via subpath import (`zod/v4`) to avoid breaking changes. Always import as:
```typescript
import { z } from "zod/v4";
```

### Database Schema as Source of Truth
- Database schemas drive type generation throughout the stack
- Use `drizzle-zod` to generate validation schemas from database tables
- Dates in schemas must use `.iso.datetime({ offset: true })` for JSON Schema compatibility
- Tables can be defined at module level for better encapsulation

### Module Registration
Modules are automatically registered if they export a valid `ModuleDefinition`:
```typescript
export default {
  name: "posts",
  routes: createPostsRoutes(),
  tables: { posts: postsTable },  // Optional: module-specific tables
  openapi: postsOpenAPI,
} satisfies ModuleDefinition;
```

### Error Handling
- Use `HTTPException` from Hono for standard HTTP errors
- Custom errors extend `APIError` class with specific error codes
- Global error handler converts all errors to consistent format
- Zod validation errors are automatically caught and formatted
- Stack traces only shown in development environment

### Middleware Architecture
- Configurable middleware system via app factory options
- Route-specific middleware (e.g., auth only on /api/* routes)
- Database connection injected via middleware
- Test environment support with middleware bypass options

## Common Patterns

### Creating New API Endpoints
Use the APIBuilder pattern for consistency:
```typescript
const builder = new APIBuilder({ endpoint: "posts" });

// GET with params validation
builder
  .get("/:id", getPostByIdHandler)
  .params({ id: z.coerce.number() })
  .openapi(getPostByIdOpenAPI);

// POST with body validation
builder
  .post("/", createPostHandler)
  .body(createPostSchema)
  .openapi(createPostOpenAPI);

// Export the built routes
export const postsRoutes = builder.build();
```

### Working with Database
Access database via middleware injection:
```typescript
const db = c.get("db");

// Query with Drizzle
const posts = await db.query.posts.findMany({
  where: eq(posts.authorId, userId),
  orderBy: desc(posts.createdAt),
});
```

### Type Imports
- Database types: `import type { SelectPost } from "@/server/types"`
- API types: Generated in `/src/generated/`
- Schemas: `import { selectPostSchema } from "@/server/schemas"`
- Zod types: `import type { z } from "zod/v4"`

### Testing Patterns
```typescript
// Create test app with proper configuration
const app = createApp({
  test: {
    env: testEnv,
    db: testDb,
    skipMiddleware: ["auth"], // Skip auth for testing
  },
});

// Use test utilities for auth
const { authRequest } = await createAuthenticatedUser(app);
const res = await authRequest.get("/api/posts");
```

## Development Workflow

### Adding a New Feature Module
1. Generate module scaffold: `bun run gen:module <name>`
2. Define database table in module's `[name].table.ts`
3. Run `bun run db:generate` to create migration
4. Run `bun run db:push:local` to apply migration
5. Implement business logic in handlers
6. Define OpenAPI schemas in `[name].openapi.ts`
7. Run `bun run gen:api` to update client types
8. Use generated hooks in React components

### Local Database Access
The D1 database file has a hash-based name. Use:
```bash
bun run db:studio  # Automatically creates db.sqlite symlink for GUI access
```

### Testing API Endpoints
- OpenAPI documentation available at `/api/docs` (Scalar UI)
- Use the interactive documentation to test endpoints
- Auth endpoints require Discord OAuth setup
- Health check available at `/api/health`

## Important Conventions

### Import Paths
- `@/` - Root src directory
- `@/server/` - Server-side code
- `@/client/` - Client-side code
- Always use path aliases, not relative imports

### File Naming
- Handlers: `[module].handlers.ts`
- Routes: `[module].routes.ts`
- OpenAPI: `[module].openapi.ts`
- Schemas: `[module].schema.ts`
- Tables: `[module].table.ts`
- Tests: `[module].test.ts` or `__tests__/[module].test.ts`

### Response Wrapping
All API responses must wrap data in an object:
```typescript
// ✅ Correct
return c.json({ post }, 200);
return c.json({ posts: results }, 200);

// ❌ Incorrect - never return raw data
return c.json(post, 200);
```

### Date Handling
- Database stores timestamps as integers (Unix milliseconds)
- API returns ISO strings with timezone
- Use `.datetime({ offset: true })` in Zod schemas for OpenAPI compatibility
- Drizzle automatically handles conversion

### Module Boundaries
- Modules should be self-contained with minimal cross-dependencies
- Use dependency injection for shared services
- Export only the module definition from index.ts
- Keep module-specific utilities within the module directory

## Advanced Patterns

### Dynamic Module Loading
The module loader uses Vite's import.meta.glob to discover modules:
- Modules must export default ModuleDefinition from index.ts
- Tables are collected from all modules for schema generation
- Routes are prefixed automatically with module name
- OpenAPI paths are merged from all modules

### Test Utilities
- `createApp()` with test configuration options
- `createAuthenticatedUser()` for auth testing
- Module-specific test utilities in `__tests__/utils/`
- In-memory D1 database for fast tests

### Environment Configuration
- Local development uses `.dev.vars`
- Production secrets via `wrangler secret put`
- Test environment can override any bindings
- Environment-specific feature flags in middleware