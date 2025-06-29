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

## CRUD Generator

For standard CRUD operations, use the CRUD generator to eliminate boilerplate entirely:

```typescript
import { createCRUDAPI } from "@/server/core/api";
import { users } from "./users.table";
import { selectUserSchema, insertUserSchema, updateUserSchema } from "./users.schema";

const api = createCRUDAPI({
  name: "user",
  table: users,
  schemas: {
    select: selectUserSchema,
    insert: insertUserSchema,
    update: updateUserSchema,
  },
  tags: ["Users"],
});

export default api.build();
```

This automatically generates:
- `GET /users` - List all users with pagination
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Customizing CRUD Operations

```typescript
const api = createCRUDAPI({
  name: "user",
  table: users,
  schemas: { select, insert, update },
  handlers: {
    // Add validation before create
    beforeCreate: async (data, c) => {
      const existing = await checkDuplicate(c, data.email);
      if (existing) {
        throw new HTTPException(409, {
          message: "Email already exists"
        });
      }
      return data;
    },
    
    // Send email after create
    afterCreate: async (user, c) => {
      await sendWelcomeEmail(user.email);
    },
    
    // Soft delete instead of hard delete
    beforeDelete: async (id, c) => {
      await c.get("db")
        .update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, id));
      throw new HTTPException(204); // Prevent default delete
    }
  }
});
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

### Combining Manual Routes with CRUD

```typescript
const api = createCRUDAPI({
  name: "post",
  table: posts,
  schemas: { select, insert, update },
})
// Add custom routes to CRUD API
.get("/posts/trending", {
  summary: "Get trending posts",
  response: response("posts", z.array(selectPostSchema)),
  handler: getTrendingPosts
})
.post("/posts/:id/like", {
  summary: "Like a post",
  params: z.object({ id: z.coerce.number() }),
  response: response("post", selectPostSchema),
  handler: likePost
});
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

1. **Use CRUD Generator for Standard Operations**: Don't write boilerplate for basic CRUD
2. **Leverage Response Helpers**: Use `response()`, `paginatedResponse()` for consistency
3. **Group Related Routes**: Use tags and common middleware
4. **Custom Handlers for Business Logic**: Use before/after hooks in CRUD generator
5. **Type Safety First**: Let TypeScript inference work for you

## Module Generator

When using `bun run gen:module <name>`, the generated module will automatically use the new API builder with CRUD operations pre-configured.

```bash
bun run gen:module products
```

This creates:
- `products.routes.ts` - Using `createCRUDAPI`
- `products.handlers.ts` - (Only needed for custom logic)
- `products.schema.ts` - Zod schemas
- `products.table.ts` - Drizzle table definition
- Full CRUD operations with zero additional code!

## Conclusion

The new API builder reduces code by 70%+ while maintaining all the benefits of type safety and OpenAPI documentation. It's designed to make the common case (CRUD) trivial while still allowing full customization when needed.