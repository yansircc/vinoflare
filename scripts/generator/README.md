# API Client Generator

This directory contains the modular API client generator for the Vinoflare template. It generates TypeScript API clients and React Query hooks from OpenAPI specifications.

## Architecture

The generator is split into focused modules:

### Core Modules

- **`types.ts`** - TypeScript interfaces for OpenAPI schema and generator types
- **`type-generator.ts`** - Converts OpenAPI schemas to TypeScript types
- **`api-client-generator.ts`** - Generates the API client code with smart parameter inference
- **`hook-generator.ts`** - Generates React Query hooks with optimal signatures
- **`templates.ts`** - Common code templates and utilities

### Main Script

- **`index.ts`** - Orchestrates the generation process

## Features

- **Smart Parameter Inference**: Analyzes operation complexity to generate optimal function signatures
- **Type Safety**: Full TypeScript support with generated types
- **React Query Integration**: Auto-generated hooks with proper invalidation
- **Query Key Factories**: Consistent cache key management
- **Mock Generators**: Helper functions for testing
- **Default Value Extraction**: Automatically applies OpenAPI schema defaults

## Usage

```bash
bun run gen:api
```

This will:
1. Fetch the OpenAPI specification from `/doc`
2. Generate `src/generated/client.ts` - API client
3. Generate `src/generated/hooks.ts` - React Query hooks
4. Generate `src/generated/index.ts` - Barrel export

## Generated API Examples

### Simple Operations (single path param, no body)
```typescript
// Generated client
apiClient.tasks.getById(id)
apiClient.tasks.delete(id)

// Generated hook
const { data } = useTask(taskId)
const deleteMutation = useDeleteTask()
deleteMutation.mutate(taskId)
```

### Medium Complexity (path param + body)
```typescript
// Generated client
apiClient.tasks.update(id, data)

// Generated hook
const updateMutation = useUpdateTask()
updateMutation.mutate({ id, data })
```

### Complex Operations (multiple params)
```typescript
// Generated client
apiClient.resources.search({ query, filters }, data)

// Generated hook with full parameters
const searchMutation = useSearchResources()
searchMutation.mutate({ query: { ... }, data: { ... } })
```