# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vinoflare v2 application - a modern full-stack TypeScript application running on Cloudflare Workers with React frontend, Hono backend, and D1 database.

## Quick Reference

### Most Common Commands
```bash
bun run dev          # Start development (http://localhost:5173)
bun run gen:module <name>  # Generate complete CRUD module (or scaffold:module)
bun run gen:api      # Update client types after API changes
bun run db:studio    # Open database UI (creates db.sqlite symlink)
bun run lint:fix     # Fix formatting issues
```

### Key Code Patterns
```typescript
// Import Zod v4 (ALWAYS use this)
import { z } from "zod/v4";

// Access database in handlers
const db = c.get("db");

// Access auth state
const user = c.get("user");
const session = c.get("session");

// Return API responses (ALWAYS wrap data)
return c.json({ post }, 200);  // Correct
return c.json(post, 200);       // Wrong!
```

## Technology Stack

- **Frontend**: React 19, TypeScript, TanStack Router/Query, Tailwind CSS, Vite
- **Backend**: Cloudflare Workers, Hono with @hono/zod-openapi, D1 Database, Drizzle ORM
- **Auth**: Better Auth with Discord OAuth only (no email/password)
- **Testing**: Vitest with Cloudflare Workers test pool
- **Code Quality**: Biome for linting/formatting
- **Package Manager**: Bun

## Essential Commands

### Development
```bash
bun run dev          # Start development server (http://localhost:5173)
bun run build        # Build both client and server
bun run typecheck    # Run TypeScript type checking
bun test            # Run all tests
bun test <file>     # Run specific test file
```

### Code Generation
```bash
bun run gen:api      # Generate OpenAPI spec and Orval client hooks
bun run gen:routes   # Generate TanStack Router types
bun run gen:types    # Generate Cloudflare binding types
bun run gen:module <name>  # Generate complete CRUD module (alias: scaffold:module)
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

### Code Quality
```bash
bun run lint        # Run Biome linter
bun run lint:fix    # Fix linting and formatting issues
```

### Deployment
```bash
bun run deploy      # Deploy to Cloudflare Workers
wrangler secret put <KEY>  # Set production secrets
```

## Architecture Overview

### Module System
The application uses a modular architecture. Each module in `/src/server/modules/` contains:
- `index.ts` - Module definition exporting routes and metadata
- `[module].handlers.ts` - Request handlers
- `[module].routes.ts` - Route definitions using @hono/zod-openapi
- `[module].schema.ts` - Zod schemas for validation
- `[module].table.ts` - Drizzle table definition
- `[module].types.ts` - TypeScript type exports
- `[module].test.ts` - Module tests

### Schema Flow
1. Database tables defined in `/src/server/db/tables/` or module's `.table.ts`
2. Zod schemas generated in `/src/server/schemas/database/` using drizzle-zod
3. Types exported from `/src/server/types/`
4. OpenAPI schemas reference Zod schemas
5. Orval generates typed client hooks from OpenAPI

### Authentication
- Uses Better Auth with Discord OAuth (no email/password)
- Default behavior: all routes protected unless in PUBLIC_API_ROUTES
- Auth state available via `c.get("user")` and `c.get("session")`
- Sessions expire after 7 days
- Rate limiting configured per endpoint

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
  basePath: "/posts",
  createModule: createPostsModule,
  metadata: {
    version: "1.0.0",
    tags: ["Posts"],
  },
} satisfies ModuleDefinition;
```

### Error Handling
- Use `HTTPException` from Hono for standard HTTP errors
- Custom errors extend `APIError` class (ResourceNotFoundError, ValidationError, UnauthorizedError)
- Global error handler converts all errors to consistent format

## Common Patterns

### Creating New API Endpoints
Use @hono/zod-openapi for type-safe routes:
```typescript
const route = createRoute({
  method: "get",
  path: "/:id",
  request: {
    params: z.object({ id: z.coerce.number() }),
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: z.object({ post: selectPostSchema }),
        },
      },
    },
  },
});

app.openapi(route, async (c) => {
  const { id } = c.req.valid("param");
  // handler logic
});
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
1. Run `bun run gen:module <name>` to generate complete module structure
2. Modify generated files as needed (handlers, schemas, etc.)
3. Run `bun run db:generate` to create migration
4. Run `bun run db:push:local` to apply migration
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

## Environment Configuration

Create `.dev.vars` for local development:
```env
# Required
BETTER_AUTH_SECRET=your-secret-key-here

# Discord OAuth (optional)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Environment
ENVIRONMENT=development
```

## Important Conventions

### Import Paths
- `@/` - Root src directory
- `@/server/` - Server-side code
- `@/client/` - Client-side code

### File Naming
- Handlers: `[module].handlers.ts`
- Routes: `[module].routes.ts`
- Schemas: `[module].schema.ts`
- Tables: `[module].table.ts`
- Types: `[module].types.ts`
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
- Use `.iso.datetime({ offset: true })` in Zod schemas for OpenAPI compatibility

## Common Gotchas

- **Always use Zod v4**: Import with `import { z } from "zod/v4"`
- **Database migrations**: Run `db:generate` after schema changes, then `db:push:local`
- **Type generation**: Run `gen:api` after API changes to update client types
- **Module generation**: Use `gen:module` instead of manually creating files
- **Response format**: Always wrap API responses in an object
- **Auth state**: Check `c.get("user")` for auth state, not request headers

## Performance Considerations

- Leverage Cloudflare Workers edge computing for low latency
- Use database indexes for frequently queried fields
- Implement caching strategies with Cloudflare Cache API
- Keep bundle sizes small with Vite code splitting

## Security Best Practices

- All routes protected by default (configure PUBLIC_API_ROUTES for exceptions)
- Use Zod schemas for input validation
- Never expose sensitive errors to clients
- Rate limiting configured per endpoint
- CORS handled by Cloudflare Workers

## Code Style & Formatting

- Biome handles all formatting and linting
- Run `bun run lint:fix` before committing
- Follow existing patterns in the codebase
- No manual prettier/eslint configuration needed

## Directory Structure

```
/src
├── client/          # React frontend
│   ├── routes/      # File-based routing (TanStack Router)
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Custom hooks and generated API hooks
│   └── lib/         # Client utilities
├── server/          # Cloudflare Workers backend
│   ├── modules/     # Feature modules (auth, posts, etc.)
│   ├── core/        # Core framework (module loader, error handling)
│   ├── db/          # Database configuration and tables
│   ├── middleware/  # Express-style middleware
│   ├── schemas/     # Generated and custom Zod schemas
│   ├── types/       # TypeScript type definitions
│   └── lib/         # Server utilities
└── generated/       # Auto-generated files
    ├── endpoints/   # Orval-generated API hooks
    ├── schemas/     # TypeScript schemas
    └── openapi.json # OpenAPI specification
```