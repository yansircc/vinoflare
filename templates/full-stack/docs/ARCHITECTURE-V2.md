# Architecture V2 - Zod v4 Native Integration

## Overview

This architecture leverages Zod v4's native JSON Schema generation capabilities to create a simpler, more maintainable system where database schemas serve as the single source of truth.

## Key Improvements

### 1. **Single Source of Truth**
- Database schemas (via drizzle-zod) define all data structures
- Zod v4's `toJSONSchema` generates OpenAPI documentation automatically
- No more duplicate schema definitions

### 2. **Simplified Route System**
- Single `RouteBuilder` class replaces the dual OpenAPI/RPC system
- Automatic validation and type inference
- Native Zod schemas throughout

### 3. **Schema Registry**
- Centralized schema management via `SchemaRegistry`
- Automatic JSON Schema generation
- Metadata and documentation support

## Architecture Components

### Schema Layer (`src/server/db/schema.ts`)
```typescript
// Define schemas with Zod v4 and register them
export const selectPostSchema = createSchema(
  "Post",
  baseSchema.extend({
    id: z.number().describe("Unique identifier"),
    // ... with transformations
  }),
  {
    description: "Blog post entity",
    tags: ["Posts"],
    example: { /* ... */ }
  }
);
```

### Route Builder (`src/server/lib/route-builder.ts`)
```typescript
// Simplified route creation
builder.addRoute({
  method: "post",
  path: "/",
  request: { body: insertPostSchema },
  responses: {
    201: { schema: createPostResponseSchema },
    ...commonResponses
  },
  handler: createPostHandler
});
```

### Module Pattern (`src/server/modules/`)
Each feature module:
- Uses native Zod schemas
- Single app instance (no dual system)
- Automatic OpenAPI documentation
- Type-safe handlers

## Benefits

1. **Reduced Complexity**: No more maintaining OpenAPI and RPC routes separately
2. **Better Type Safety**: Direct use of Zod schemas everywhere
3. **Less Dependencies**: Reduced reliance on @hono/zod-openapi internals
4. **Automatic Documentation**: JSON Schema generation from Zod schemas
5. **Easier Testing**: Single route definition to test

## Migration Guide

### Before (Dual System):
```typescript
// Had to maintain both OpenAPI and RPC routes
return {
  openAPI: factory.getOpenAPIApp(),
  rpc: factory.getRPCApp(),
};
```

### After (Unified System):
```typescript
// Single app with full type inference
return builder.getApp();
```

## Schema Organization

```
server/
├── db/
│   └── schema.ts          # Database schemas + Zod definitions
├── schemas/
│   └── common.ts          # Common response schemas
├── lib/
│   ├── schema-registry.ts # Schema management
│   └── route-builder.ts   # Route creation
└── modules/
    └── [feature]/
        └── [feature].module.ts
```

## Type Generation

Run `bun gen:openapi` to:
1. Generate OpenAPI JSON specification
2. Export all registered schemas
3. Create TypeScript types (optional)

## Best Practices

1. **Always use Schema Registry**: Register all schemas for documentation
2. **Transform in Schemas**: Handle date/time transforms in schema definitions
3. **Consistent Responses**: Use common response schemas
4. **Module Independence**: Each module should be self-contained