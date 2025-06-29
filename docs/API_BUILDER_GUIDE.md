# API Builder Guide

This guide explains how to use the new API builder architecture in Vinoflare v2, which significantly reduces boilerplate code while maintaining type safety and OpenAPI documentation generation.

## Table of Contents

1. [Overview](#overview)
2. [Basic Usage](#basic-usage)
3. [CRUD Generator](#crud-generator)
4. [Advanced Usage](#advanced-usage)
5. [Migration Guide](#migration-guide)

## Overview

The new API builder provides a fluent interface for defining routes with automatic:
- Error response handling
- OpenAPI documentation generation
- Type safety throughout
- Response wrapping
- Middleware support

## Basic Usage

### Creating Simple Routes

```typescript
import { createAPI, response } from "@/server/core/api";
import { z } from "zod/v4";

const api = createAPI()
  .tags("Users")
  
  .get("/users", {
    summary: "Get all users",
    response: response("users", z.array(userSchema)),
    handler: async (c) => {
      const users = await c.get("db").query.users.findMany();
      return c.json({ users });
    }
  })
  
  .get("/users/:id", {
    summary: "Get user by ID",
    params: z.object({ id: z.coerce.number() }),
    response: response("user", userSchema),
    handler: async (c) => {
      const id = Number(c.req.param("id"));
      const user = await getUserById(c, id);
      return c.json({ user });
    }
  })
  
  .post("/users", {
    summary: "Create user",
    body: createUserSchema,
    response: response("user", userSchema),
    status: 201,
    handler: async (c) => {
      const data = await c.req.json();
      const user = await createUser(c, data);
      return c.json({ user }, 201);
    }
  });

export default api.build();
```

### Key Features

1. **Automatic Error Responses**: All routes automatically include standard error responses (400, 401, 403, 404, 409, 422, 429, 500)

2. **Response Wrapping**: The `response()` helper automatically wraps responses:
   - `response("user", userSchema)` → `{ user: User }`
   - `response("user", z.array(userSchema))` → `{ users: User[] }`

3. **Type Safety**: Full TypeScript inference for params, query, body, and responses

## Building CRUD APIs

While the API builder doesn't have a dedicated CRUD generator, you can easily create consistent CRUD operations using the fluent API with proper error handling:

```typescript
import { createAPI, response, commonErrors } from "@/server/core/api";

const api = createAPI()
  .tags("Users")
  
  // List with pagination
  .get("/", {
    summary: "Get all users",
    query: z.object({
      page: z.coerce.number().positive().default(1),
      limit: z.coerce.number().positive().max(100).default(10),
    }),
    response: z.object({
      users: z.array(userSchema),
      pagination: paginationSchema,
    }),
    includeStandardErrors: false,
    errors: commonErrors.public,
    handler: listUsersHandler
  })
  
  // Get by ID
  .get("/:id", {
    summary: "Get user by ID",
    params: z.object({ id: z.coerce.number() }),
    response: response("user", userSchema),
    includeStandardErrors: false,
    errors: commonErrors.crud,
    handler: getUserHandler
  })
  
  // Create
  .post("/", {
    summary: "Create user",
    body: createUserSchema,
    response: response("user", userSchema),
    status: 201,
    includeStandardErrors: false,
    errors: commonErrors.crud,
    handler: createUserHandler
  })
  
  // Update
  .put("/:id", {
    summary: "Update user",
    params: z.object({ id: z.coerce.number() }),
    body: updateUserSchema,
    response: response("user", userSchema),
    includeStandardErrors: false,
    errors: commonErrors.crud,
    handler: updateUserHandler
  })
  
  // Delete
  .delete("/:id", {
    summary: "Delete user",
    params: z.object({ id: z.coerce.number() }),
    response: undefined,
    status: 204,
    includeStandardErrors: false,
    errors: {
      404: "User not found",
      500: "Failed to delete user"
    },
    handler: deleteUserHandler
  });
```

## Error Response Control

By default, all routes include standard error responses. You can customize this behavior:

### Disable Standard Errors Globally

```typescript
const api = createAPI()
  .standardErrors(false)  // Disable all standard errors
  .tags("Public")
  
  .get("/status", {
    summary: "Health check",
    response: z.object({ status: z.string() }),
    // Only includes success response
    handler: (c) => c.json({ status: "ok" })
  });
```

### Custom Error Responses Per Route

```typescript
.get("/users/:id", {
  summary: "Get user",
  params: z.object({ id: z.coerce.number() }),
  response: response("user", userSchema),
  includeStandardErrors: false,  // Disable standard errors for this route
  errors: {
    404: "User not found",
    403: "Access denied to user data"
  },
  handler: getUserHandler
})
```

### Use Common Error Combinations

```typescript
import { commonErrors } from "@/server/core/api";

.get("/public/data", {
  summary: "Public endpoint",
  response: dataSchema,
  includeStandardErrors: false,
  errors: commonErrors.public,  // Only public-appropriate errors
  handler: getPublicData
})

// Available error sets:
// - commonErrors.auth: 401, 403
// - commonErrors.crud: 400, 404, 409, 422
// - commonErrors.minimal: 400, 500
// - commonErrors.public: 400, 404, 429, 500 (no auth errors)
```

### Mix Standard and Custom Errors

```typescript
.post("/special", {
  summary: "Special endpoint",
  body: inputSchema,
  response: outputSchema,
  // Keeps standard errors AND adds custom ones
  errors: {
    402: "Payment Required",
    418: "I'm a teapot"
  },
  handler: specialHandler
})
```

## Advanced Usage

### Custom Middleware

```typescript
const api = createAPI()
  .middleware(authMiddleware, rateLimitMiddleware)
  .tags("Admin")
  
  .get("/admin/stats", {
    summary: "Get admin statistics",
    middleware: [requireRole("admin")], // Route-specific middleware
    response: statsSchema,
    handler: getAdminStats
  });
```

### Multiple Response Types

```typescript
.get("/data", {
  summary: "Get data with conditional response",
  query: z.object({ format: z.enum(["json", "csv"]) }),
  response: {
    200: jsonResponseSchema,
    202: acceptedSchema,
  },
  handler: async (c) => {
    const { format } = c.req.query();
    if (format === "csv") {
      // Start async export
      return c.json({ jobId: "123" }, 202);
    }
    return c.json({ data: [...] }, 200);
  }
})
```


## Migration Guide

### Before (Traditional OpenAPI)

```typescript
const route = createRoute({
  method: "get",
  path: "/users/:id",
  request: {
    params: z.object({ id: z.coerce.number() })
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: z.object({ user: userSchema })
        }
      }
    },
    400: { /* ... */ },
    401: { /* ... */ },
    404: { /* ... */ },
    // ... many more error responses
  }
});

app.openapi(route, handler);
```

### After (New API Builder)

```typescript
api.get("/users/:id", {
  summary: "Get user by ID",
  params: z.object({ id: z.coerce.number() }),
  response: response("user", userSchema),
  handler
});
```

## Best Practices

1. **Choose Appropriate Error Sets**: Use `commonErrors` presets for consistency
2. **Leverage Response Helpers**: Use `response()`, `paginatedResponse()` for consistency
3. **Group Related Routes**: Use tags and common middleware
4. **Minimize Standard Errors**: Only include errors your endpoint actually uses
5. **Type Safety First**: Let TypeScript inference work for you

## Module Generator

When using `bun run gen:module <name>`, the generated module will automatically use the new API builder with proper CRUD routes and error handling.

```bash
bun run gen:module products
```

This creates:
- `products.routes.ts` - Complete CRUD routes with proper error handling
- `products.handlers.ts` - Handler stubs (for reference, routes are inline)
- `products.schema.ts` - Zod schemas
- `products.table.ts` - Drizzle table definition
- All routes use appropriate `commonErrors` presets

## Conclusion

The new API builder reduces code by 70%+ while maintaining all the benefits of type safety and OpenAPI documentation. It provides a clean, flexible API for defining routes with proper error handling.