# Posts Module Migration Comparison

## Before: Traditional OpenAPI Route Definition

The original `posts.routes.ts` file had ~200 lines with repetitive boilerplate:

```typescript
// Every route needed full OpenAPI definition
const getLatestPostRoute = createRoute({
  method: "get",
  path: "/latest",
  summary: "Get latest post",
  tags: ["Posts"],
  responses: {
    200: {
      description: "Latest post",
      content: {
        "application/json": {
          schema: z.object({
            post: selectPostSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
              path: z.string(),
            }),
          }),
        },
      },
    },
    // ... repeated for 401, 403, 404, 500, etc.
  },
});
```

## After: New API Builder

The new approach reduces code by 70%+ and is more readable:

### Option 1: Manual Route Definition (Simple & Clean)
```typescript
const api = createAPI()
  .tags("Posts")
  
  .get("/latest", {
    summary: "Get latest post",
    response: response("post", selectPostSchema),
  }, getLatestPostHandler)
  
  .get("/:id", {
    summary: "Get post by ID",
    params: z.object({ id: z.coerce.number() }),
    response: response("post", selectPostSchema),
  }, getPostByIdHandler);
```

### Option 2: CRUD Generator (Zero Boilerplate)
```typescript
const api = createCRUDAPI({
  name: "post",
  table: posts,
  schemas: {
    select: selectPostSchema,
    insert: insertPostSchema,
    update: updatePostSchema,
  },
});
```

## Benefits

1. **Reduced Boilerplate**: Error responses are automatically included
2. **Type Safety**: Full TypeScript inference throughout
3. **Consistency**: All APIs follow the same patterns
4. **Flexibility**: Can mix manual routes with CRUD generator
5. **Maintainability**: Changes to error format only need one update

## Migration Steps

1. Import new API utilities: `createAPI`, `createCRUDAPI`, `response`
2. Replace `createRoute` + `openapi` pattern with fluent API
3. Remove repetitive error response definitions
4. Use `response()` helper for automatic response wrapping
5. Consider using CRUD generator for standard operations