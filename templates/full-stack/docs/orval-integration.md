# Orval Integration Guide

This project uses Orval to automatically generate type-safe API client code from OpenAPI specifications.

## Overview

Instead of manually maintaining RPC types or writing API client code, we use:

1. **OpenAPI Specification** - Single source of truth for API contracts
2. **Orval** - Generates React Query hooks and TypeScript types
3. **Automatic Type Safety** - End-to-end type safety from server to client

## Workflow

### 1. Generate OpenAPI Specification

```bash
bun run gen:openapi
```

This command:
- Uses Hono's `app.request()` to fetch the OpenAPI spec without starting a server
- Saves the spec to `src/generated/openapi.json`
- Works even when the dev server is not running

### 2. Generate Client Code

```bash
bun run gen:api
```

This command:
- Reads the OpenAPI specification
- Generates React Query hooks in `src/generated/endpoints/`
- Generates TypeScript types in `src/generated/schemas/`
- Uses custom fetch instance for Cloudflare Workers compatibility

### 3. Use Generated Hooks

```typescript
import { useGetPostsLatest, usePostPosts } from "@/generated/endpoints/posts/posts";

// Simple usage
const { data, isLoading } = useGetPostsLatest();

// With mutations
const createPost = usePostPosts({
  mutation: {
    onSuccess: () => console.log("Success!"),
  },
});
```

## Configuration

### Orval Config (`orval.config.ts`)

```typescript
export default defineConfig({
  vinoflare: {
    input: "./src/generated/openapi.json",
    output: {
      mode: "tags-split",          // Split by API tags
      target: "./src/generated/endpoints",
      schemas: "./src/generated/schemas",
      client: "react-query",       // Generate React Query hooks
      override: {
        mutator: {
          path: "./src/client/hooks/api/custom-instance.ts",
          name: "customInstance",  // Custom fetch for Cloudflare
        },
      },
    },
  },
});
```

### Custom Instance

The custom instance (`src/client/hooks/api/custom-instance.ts`) provides:
- Cloudflare Workers compatible fetch implementation
- Axios-like interface for Orval compatibility
- Centralized error handling
- Request/response interceptors support

## Benefits

1. **Type Safety** - Types are generated from the OpenAPI spec
2. **No Manual Maintenance** - No need to manually sync client types with server
3. **React Query Integration** - Automatic caching, mutations, and loading states
4. **Single Source of Truth** - OpenAPI spec drives everything

## Adding New Endpoints

1. Add the endpoint in your server module (e.g., `posts.routes.ts`)
2. Run `bun run gen:openapi` to update the spec
3. Run `bun run gen:api` to generate new client code
4. Import and use the generated hooks

## Best Practices

1. **Don't Edit Generated Files** - They will be overwritten
2. **Keep OpenAPI Annotations Updated** - They drive the client generation
3. **Use Generated Types** - Import from `@/generated/schemas`
4. **Wrap Generated Hooks** - Create custom hooks that add business logic

## Example: Custom Hook

```typescript
// src/client/hooks/use-posts.ts
import { useGetPostsLatest, usePostPosts } from "@/generated/endpoints/posts/posts";
import { toast } from "sonner";

export function usePosts() {
  const { data, isLoading } = useGetPostsLatest();
  
  const createMutation = usePostPosts({
    mutation: {
      onSuccess: () => toast.success("Post created!"),
      onError: () => toast.error("Failed to create post"),
    },
  });

  return {
    latestPost: data,
    isLoading,
    createPost: (title: string) => 
      createMutation.mutate({ data: { title } }),
  };
}
```

## Troubleshooting

### OpenAPI Warnings
Some warnings during generation are normal and don't affect functionality:
- `must have required property '$ref'` - Schema formatting differences
- `additional properties` - Extra metadata in schemas

### Type Errors
If you see type errors after generation:
1. Check that the OpenAPI spec is up to date
2. Ensure all schema imports are correct
3. Run `bun run typecheck` to verify

### Missing Endpoints
If endpoints are missing:
1. Verify they have OpenAPI annotations
2. Check that they're registered in the API routes
3. Regenerate both OpenAPI and client code