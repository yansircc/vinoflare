# Project Architecture

## Overview

This project uses a modern TypeScript stack with clear separation between client and server code, unified API system supporting both OpenAPI documentation and RPC type inference.

## Directory Structure

```
src/
├── client/                 # Frontend code
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Client utilities
│   └── routes/           # TanStack Router pages
├── server/                # Backend code
│   ├── db/               # Database (Drizzle ORM)
│   ├── lib/              # Server utilities
│   │   ├── response.ts   # Unified response helpers
│   │   └── route-factory.ts # Route generation
│   ├── middleware/       # Express/Hono middleware
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── hello/       # Hello endpoint
│   │   └── posts/       # Posts CRUD
│   └── routes/          # Route definitions
├── client.tsx            # Client entry
├── index.tsx             # Server entry
├── renderer.tsx          # SSR renderer
└── router.tsx           # Router setup
```

## Key Features

### 1. Unified Route System

Each module uses a single definition to generate both OpenAPI and RPC routes:

```typescript
// modules/posts/posts.module.ts
export const createPostsModule = () => {
  const factory = new RouteFactory("/posts");
  
  factory.addRoute({
    method: "get",
    path: "/latest",
    tags: ["Posts"],
    responses: { /* OpenAPI schema */ },
    handler: getLatestPostHandler,
  });
  
  return {
    openAPI: factory.getOpenAPIApp(),
    rpc: factory.getRPCApp(),
  };
};
```

### 2. Standardized Response Format

All API responses follow a consistent format:

```typescript
// Success
{
  success: true,
  data: T,
  meta?: { timestamp: string, ... }
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any,
    timestamp: string
  }
}
```

### 3. Type-Safe RPC Client

Frontend uses Hono's RPC client with full type inference:

```typescript
import { api } from "@server/lib/hc";

// Fully typed API calls
const response = await api.api.posts.latest.$get();
const data = await response.json();
```

### 4. Module Pattern

Each feature is organized as a module with:
- Unified route definitions
- Shared handlers
- Schema validation
- Consistent error handling

## Development Guidelines

1. **Creating New Modules**: Use the module pattern in `server/modules/`
2. **API Routes**: Define once, get both OpenAPI docs and RPC types
3. **Response Format**: Always use `respond` helpers from `server/lib/response.ts`
4. **Client Code**: Keep all frontend code under `client/`
5. **Type Aliases**: Use `@client/*` and `@server/*` for clear imports

## Benefits

- **No Duplication**: Single route definition for docs and types
- **Type Safety**: End-to-end type inference
- **Clear Structure**: Obvious separation of concerns
- **Consistent APIs**: Standardized response format
- **Better DX**: Auto-generated docs and types