# Schema Management: Single Source of Truth

This document explains how we maintain database schemas as the single source of truth while using OpenAPI documentation.

## The Challenge

We have two different Zod instances:
1. **drizzle-zod**: Used for database schema validation (imports from `zod`)
2. **@hono/zod-openapi**: Used for OpenAPI documentation (imports from `@hono/zod-openapi`)

These cannot be mixed directly, but we want to avoid duplicating schema definitions.

## Our Solution

### 1. Database Schema as Source of Truth

All data models are defined in Drizzle table definitions:
```typescript
// src/server/db/schema.ts
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

### 2. Drizzle-Zod for Database Operations

Drizzle-zod automatically generates Zod schemas from table definitions:
```typescript
export const selectPostSchema = createSelectSchema(posts);
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
});
```

### 3. OpenAPI Schemas Mirror Database Schemas

OpenAPI schemas are defined to match the structure of drizzle-zod schemas:
```typescript
// src/server/lib/schemas/posts.ts
export const PostSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  createdAt: z.string().datetime(), // ISO string format
}).openapi("Post");
```

## Best Practices

### When Adding a New Field

1. **Update Drizzle Table Definition**
   ```typescript
   // src/server/db/schema.ts
   export const posts = sqliteTable("posts", {
     // ... existing fields
     content: text("content"), // NEW FIELD
   });
   ```

2. **Update Drizzle-Zod Validation (if needed)**
   ```typescript
   export const insertPostSchema = createInsertSchema(posts, {
     // ... existing validations
     content: z.string().optional(), // NEW VALIDATION
   });
   ```

3. **Update OpenAPI Schema**
   ```typescript
   // src/server/lib/schemas/posts.ts
   export const PostSchema = z.object({
     // ... existing fields
     content: z.string().optional(), // NEW FIELD
   });
   ```

### When Changing Validation Rules

1. **Update in Drizzle-Zod Schema**
   ```typescript
   export const insertPostSchema = createInsertSchema(posts, {
     title: z.string()
       .min(1, "Title is required")
       .max(200, "Title must be 200 characters or less"), // CHANGED
   });
   ```

2. **Mirror in OpenAPI Schema**
   ```typescript
   export const CreatePostRequestSchema = z.object({
     title: z.string()
       .min(1, "Title is required")
       .max(200, "Title must be 200 characters or less"), // MUST MATCH
   });
   ```

## Type Safety

Both schemas generate the same TypeScript types:
```typescript
// From drizzle-zod
type Post = z.infer<typeof selectPostSchema>;

// From OpenAPI (should be identical structure)
type PostAPI = z.infer<typeof PostSchema>;
```

## Future Improvements

### Option 1: Code Generation
Create a script that reads Drizzle table definitions and generates OpenAPI schemas automatically.

### Option 2: Runtime Conversion
Create a utility that converts drizzle-zod schemas to OpenAPI schemas at runtime:
```typescript
const PostSchema = convertToOpenAPI(selectPostSchema, {
  name: "Post",
  fields: {
    id: { description: "Unique identifier" },
    title: { description: "Post title" },
  }
});
```

### Option 3: Shared Schema Definition
Define schemas in a neutral format and generate both Drizzle and OpenAPI schemas from it.

## Testing Schema Consistency

Run tests to ensure schemas remain synchronized:
```typescript
test("OpenAPI schema matches Drizzle schema", () => {
  const drizzlePost = selectPostSchema.parse(testData);
  const openAPIPost = PostSchema.parse(testData);
  
  expect(drizzlePost).toEqual(openAPIPost);
});
```

## Conclusion

While we currently maintain parallel schemas, the structure is clear:
- Database schema (Drizzle) is the source of truth
- OpenAPI schemas mirror the database schemas
- Validation rules must be kept in sync manually
- Type safety helps catch inconsistencies

This approach provides the benefits of both drizzle-zod and OpenAPI documentation while maintaining a clear source of truth.