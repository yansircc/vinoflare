# Vinoflare Full-Stack to API-Only Migration Guide

This document details the complete process of converting a Vinoflare full-stack application to an API-only service. This guide is intended for developers who want to create a similar migration process or build a CLI tool for automated conversion.

## Overview

The migration transforms a full-stack Cloudflare Workers application with React frontend into a pure API service, removing all frontend code while preserving the complete backend functionality.

## Migration Steps

### 1. Remove Frontend Source Code

**Files/Directories to Remove:**
```bash
# Remove entire client directory
rm -rf src/client/
```

This removes:
- `app.css` - Tailwind CSS styles
- `client.tsx` - Client entry point
- `renderer.tsx` - SSR renderer
- `router.tsx` - Frontend router setup
- `components/` - All React components
- `lib/` - Client utilities (auth, query-client, design utilities, custom-fetch)
- `routes/` - All frontend route definitions

### 2. Update Application Entry Point

**Convert `src/index.tsx` to `src/index.ts`:**

```typescript
// Before (index.tsx)
/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { STATIC_ROUTES } from "@/server/config/routes";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";
import { renderer } from "./client/renderer";

// After (index.ts)
import { Hono } from "hono";
import { createApp } from "@/server/core/app-factory";
import { loadModules } from "@/server/core/module-loader";

async function createMainApp() {
	const app = new Hono<{ Bindings: CloudflareBindings }>();

	// Create and mount API app with dynamic module loading
	const modules = await loadModules();

	// Register modules for database middleware
	const { ModuleRegistry } = await import("@/server/db/modular");
	ModuleRegistry.register(modules);

	const apiApp = createApp({
		modules,
		basePath: "",
		middleware: {
			database: true,
			auth: true,
			cors: true,
			logger: true,
			trimSlash: true,
		},
		includeDocs: true,
		includeHealthCheck: true,
	});

	app.route("/api", apiApp);

	// Handle root redirect to API docs
	app.get("/", (c) => {
		return c.redirect("/api/docs");
	});

	// 404 handler for non-API routes
	app.all("*", (c) => {
		return c.json({ error: "Not found. This is an API-only server." }, 404);
	});

	return app;
}

// Export for Cloudflare Workers
export default {
	async fetch(
		request: Request,
		env: CloudflareBindings,
		ctx: ExecutionContext,
	) {
		const app = await createMainApp();
		return app.fetch(request, env, ctx);
	},
};
```

**Key Changes:**
- Remove JSX pragma
- Remove static asset handling
- Remove frontend renderer middleware
- Add root redirect to API docs
- Add JSON 404 handler
- Change export format for Cloudflare Workers

### 3. Remove Frontend Build Output and Generated Files

```bash
rm -rf dist/client
rm -f src/generated/routeTree.gen.ts
rm -rf src/generated/endpoints
rm -rf src/generated/schemas
rm -f src/utils/manifest.ts
```

### 4. Remove Frontend Configuration Files

```bash
rm -f postcss.config.js
rm -f tsr.config.json
rm -f orval.config.ts
```

### 5. Update package.json

**Remove Frontend Dependencies:**
```json
// Dependencies to remove:
"@tailwindcss/vite"
"@tanstack/react-query"
"@tanstack/react-router"
"axios"
"clsx"
"sonner"
"tailwind-merge"

// DevDependencies to remove:
"@tailwindcss/postcss"
"@tanstack/router-cli"
"@tanstack/router-plugin"
"@types/react"
"@types/react-dom"
"orval"
"postcss"
```

**Update Scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "rm -rf dist && vite build",
    "gen:api": "bun scripts/generate-openapi.ts"
    // Remove: "gen:routes" script
  }
}
```

### 6. Simplify Vite Configuration

**Update `vite.config.ts`:**
```typescript
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		cloudflare({
			configPath: "./wrangler.toml",
			persistState: true,
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@server": path.resolve(__dirname, "./src/server"),
		},
	},
	ssr: {
		external: ["node:async_hooks"],
	},
	build: {
		ssr: true,
		emptyOutDir: true,
	},
});
```

### 7. Update TypeScript Configuration

**Update `tsconfig.json`:**
```json
{
	"compilerOptions": {
		"lib": ["ES2022"],  // Remove "DOM", "DOM.Iterable"
		// Remove "jsx": "react-jsx"
		"types": ["@cloudflare/workers-types", "node", "vite/client"],
		"paths": {
			"@/*": ["./src/*"],
			"@server/*": ["./src/server/*"]
			// Remove "@client/*" path
		}
	}
}
```

### 8. Update Wrangler Configuration

**Update `wrangler.toml`:**
```toml
name = "my-vinoflare-app"
compatibility_date = "2025-06-17"
compatibility_flags = ["nodejs_compat"]
main = "./src/index.ts"  # Changed from .tsx

# Remove [assets] section entirely

[observability.logs]
enabled = true

[[d1_databases]]
binding = "DB"
database_name = "vinoflare-demo"
database_id = "your-database-id"
migrations_dir = "src/server/db/migrations"
```

### 9. Remove Static Assets

```bash
rm -rf public/
```

### 10. Update Server Routes Configuration

**Update `src/server/config/routes.ts`:**
```typescript
// Remove STATIC_ROUTES export
// Keep only PUBLIC_API_ROUTES

export const PUBLIC_API_ROUTES = [
	"/api/hello",
	"/api/auth/sign-in/*",
	"/api/auth/sign-up/*",
	// ... other public routes
] as const;
```

## Verification Steps

After completing the migration, verify the API-only server:

### 1. Type Checking
```bash
bun run typecheck
```

### 2. Linting
```bash
bun run lint
```

### 3. Build Test
```bash
bun run build
```

### 4. API Functionality Test
```bash
bun run dev

# Test endpoints
curl http://localhost:5173/api/health
curl http://localhost:5173/api/openapi.json
```

## Files Modified Summary

### Deleted Files/Directories:
- `/src/client/` (entire directory)
- `/dist/client/`
- `/public/`
- `/src/generated/routeTree.gen.ts`
- `/src/generated/endpoints/`
- `/src/generated/schemas/`
- `/src/utils/manifest.ts`
- `postcss.config.js`
- `tsr.config.json`
- `orval.config.ts`

### Modified Files:
- `src/index.tsx` → `src/index.ts` (renamed and rewritten)
- `package.json` (removed frontend deps and scripts)
- `vite.config.ts` (simplified for API-only)
- `tsconfig.json` (removed frontend types)
- `wrangler.toml` (removed assets, updated main)
- `src/server/config/routes.ts` (removed STATIC_ROUTES)
- `/scripts/generate-module/templates/` (all templates updated to remove frontend references)

### Unchanged:
- All `/src/server/` code (except routes.ts)
- Database migrations and schemas
- Module templates
- Test configurations
- Environment variables

## CLI Tool Implementation Guide

To create an automated migration tool, implement these steps:

### 1. Pre-flight Checks
```typescript
function preflightChecks() {
  // Check if it's a Vinoflare project
  if (!fs.existsSync('src/client')) {
    throw new Error('No frontend code found - already API-only?');
  }
  
  // Backup recommendation
  console.log('⚠️  Recommend creating a backup or new branch before proceeding');
}
```

### 2. File Operations
```typescript
const filesToDelete = [
  'src/client',
  'dist/client',
  'public',
  'postcss.config.js',
  'tsr.config.json',
  'orval.config.ts',
  // ... etc
];

const filesToModify = [
  { path: 'src/index.tsx', transform: convertIndexFile },
  { path: 'package.json', transform: updatePackageJson },
  { path: 'vite.config.ts', transform: updateViteConfig },
  // ... etc
];
```

### 3. Dependency Management
```typescript
const depsToRemove = [
  '@tailwindcss/vite',
  '@tanstack/react-query',
  '@tanstack/react-router',
  // ... etc
];

function updatePackageJson(content: string) {
  const pkg = JSON.parse(content);
  
  // Remove dependencies
  depsToRemove.forEach(dep => {
    delete pkg.dependencies?.[dep];
    delete pkg.devDependencies?.[dep];
  });
  
  // Update scripts
  pkg.scripts.dev = 'vite';
  delete pkg.scripts['gen:routes'];
  
  return JSON.stringify(pkg, null, 2);
}
```

### 4. Post-migration Tasks
```typescript
async function postMigration() {
  // Run type checking
  await exec('bun run typecheck');
  
  // Run linting
  await exec('bun run lint');
  
  // Attempt build
  await exec('bun run build');
  
  console.log('✅ Migration complete!');
  console.log('📚 API docs will be available at http://localhost:5173/api/docs');
}
```

## Common Issues and Solutions

### Issue: Import errors after migration
**Solution:** Update `tsconfig.json` to include `"vite/client"` in types array for `import.meta.glob` support.

### Issue: Wrangler dev server fails
**Solution:** Ensure the export format in `index.ts` matches Cloudflare Workers requirements with proper `fetch` handler.

### Issue: Build fails with asset errors
**Solution:** Remove `[assets]` section from `wrangler.toml` and ensure no references to `ASSETS` binding remain.

## Benefits of API-Only Architecture

1. **Simplified Deployment**: No frontend build complexity
2. **Framework Agnostic**: Can be used with any frontend framework
3. **Better Separation of Concerns**: Clear API boundaries
4. **Easier Testing**: API-only testing is more straightforward
5. **Microservice Ready**: Can be part of a larger microservices architecture

## Next Steps

After migration, consider:

1. **API Versioning**: Implement versioning strategy (e.g., `/api/v1/`)
2. **Rate Limiting**: Add rate limiting middleware
3. **API Key Authentication**: For machine-to-machine communication
4. **Monitoring**: Set up API monitoring and analytics
5. **Documentation**: Enhance OpenAPI documentation with examples

## Conclusion

This migration process cleanly separates the API from the frontend, creating a standalone API service that maintains all backend functionality while removing frontend complexity. The resulting API-only service is more focused, easier to maintain, and can serve multiple frontend applications or other services.