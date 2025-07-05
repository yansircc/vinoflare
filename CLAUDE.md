# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI tool for scaffolding modern full-stack TypeScript applications optimized for Cloudflare Workers. It provides 9 different template options with varying features (auth, database, full-stack vs API-only, Orval vs Hono RPC for API client generation).

## Essential Commands

### Development
```bash
# Run CLI in development mode
bun dev

# Build the CLI tool
bun build

# Type checking
bun typecheck

# Linting
bun lint         # Check for issues
bun lint:fix     # Auto-fix issues

# Testing
bun test     # Run E2E tests sequentially
bun test:parallel # Run E2E tests in parallel

# Test npm package locally
bun pack:test
```

### Testing a Single Template
```bash
# Run CLI with specific template name
bun dev create test-project --type full-stack

# With RPC client instead of Orval
bun dev create test-project --type full-stack --rpc

# Or interactively
bun dev create test-project
```

## Architecture

### CLI Flow
1. **Entry**: `src/index.ts` - Main entry point with error handling
2. **CLI Setup**: `src/cli.ts` - Commander configuration and command parsing
3. **User Interaction**: `src/prompts.ts` - Interactive prompts using @clack/prompts
4. **Template Selection**: `src/branch-mapper.ts` - Maps template choices to Git branches
5. **Project Building**: `src/builder.ts` - Clones template, installs dependencies, initializes git

### Template Structure
Each template (in `templates/` directory) is a complete project with:
- Cloudflare Workers backend with Hono
- Optional: React frontend with TanStack Router
- Optional: Cloudflare D1 database with Drizzle ORM
- Optional: Better Auth with Discord OAuth
- Optional: Hono RPC client (instead of Orval/OpenAPI) for type-safe API calls
- Build tooling: Vite for frontend, Wrangler for Workers

### Key Design Decisions
- Templates are maintained as separate Git branches for easy updates
- Uses a single repository (github.com/yansircc/vinoflare) with branch-based templates
- Supports multiple package managers (npm, yarn, pnpm, bun) with automatic detection
- Provides both programmatic and interactive usage

## Important Implementation Details

### Package Manager Handling
The CLI detects and uses the appropriate package manager based on:
1. User's explicit choice via `--pm` flag
2. Lock files in the current directory
3. Executable availability
4. Default: npm

See `src/prompts.ts:detectPackageManager()` for implementation.

### Template Branch Mapping
Templates are mapped to Git branches in `src/branch-mapper.ts`:
- Full-stack with Orval: `orval`, `orval-no-auth`, `orval-no-db`
- Full-stack with RPC: `rpc`, `rpc-no-auth`, `rpc-no-db`
- API-only: `api`, `api-no-auth`, `api-no-db`

### API Client Generation
- Orval templates use `npm run gen:api` to generate OpenAPI-based client hooks
- RPC templates use `npm run gen:client` to generate Hono RPC client

### Error Handling
- All errors are caught in `src/index.ts:main()` and displayed using @clack/prompts
- Git operations have specific error handling for common issues
- Package manager commands are wrapped with proper error messages

## Testing Strategy

E2E tests (`scripts/test-all.ts`) validate each template by:
1. Creating a project with the template
2. Installing dependencies
3. Running build commands
4. Verifying output exists

Run individual template tests during development to save time.