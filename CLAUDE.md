# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

create-vino-app is a CLI tool that scaffolds modern full-stack TypeScript applications using:
- **Hono** - Fast web framework for Cloudflare Workers
- **React + TanStack Router** - Type-safe routing for React applications (full-stack only)
- **D1 Database** with Drizzle ORM (optional)
- **Better Auth** - Authentication solution (optional, requires database)

## Development Commands

```bash
# Development
bun run dev                 # Run CLI in development mode (tsx src/index.ts)

# Building
bun run build              # Build CLI with tsup

# Testing
bun run test               # Run all tests with vitest
bun run test:integration   # Run integration tests only
bun run test:unit          # Run unit tests only
bun run test:all           # Run all test scenarios (comprehensive testing)

# Code Quality
bun run typecheck          # TypeScript type checking (tsc --noEmit)
bun run lint               # Run Biome linter
bun run lint:fix           # Fix linting issues with Biome

# Template Validation
bun run validate           # Validate all templates
```

## Architecture

The project follows a **modular, plugin-based architecture**:

### Core Components

1. **CLI Layer** (`src/cli/`)
   - `parser.ts` - Command-line argument parsing
   - `prompts.ts` - Interactive user prompts
   - `help.ts` - Help message display

2. **Core Layer** (`src/core/`)
   - `context.ts` - Manages execution context throughout the build process
   - `project-builder.ts` - Orchestrates the project building pipeline

3. **Processor System** (`src/processors/`)
   - Plugin-like processors that handle specific features
   - Each processor implements the `Processor` interface with `shouldProcess()` and `process()` methods
   - Processors are registered in `registry.ts` and executed in order
   - Key processors: 
     - `copy-template` - Copies template files to target directory
     - `feature-cleanup` - Removes files based on feature selections
     - `file-transform` - Applies transformations based on rules
     - `package-json` - Updates package.json with project details
     - `project-init` - Initializes the project (git, install deps)
     - `client-no-db` - Handles client-side adjustments for no-db scenarios

4. **Template System** (`src/templates/`)
   - `template-loader.ts` - Loads and validates templates
   - `transformers/` - File transformers for different file types (JSON, TypeScript)
   - Transform rules defined in `config/transform-rules.json`

### Entry Points

- `src/index.ts` - Main CLI entry point (legacy approach)
- `src/index-modular.ts` - New modular architecture entry point (recommended)
- `src/index-legacy.ts` - Legacy entry point

### Template Structure

```
templates/
├── api-only/          # API-only template
├── full-stack/        # Full-stack template with React frontend
├── minimal-modules/   # Minimal module examples for no-db scenarios
└── replacements/      # Replacement files for different feature combinations
```

## Key Implementation Details

### Feature Removal Logic

When users opt out of features, the CLI intelligently removes related files and dependencies:

- **No Database**: Removes all database-related files, Drizzle, auth (auth requires DB)
- **No Auth** (with DB): Removes only auth-related files and Better Auth dependency
- **API-only**: Removes all frontend-related files and dependencies

### File Transformation System

The project uses a flexible transformation system for modifying files based on selected features:
- Rules defined in `config/transform-rules.json`
- Transformers handle different file types (JSON, TypeScript)
- Supports conditional transformations based on project configuration

### Package Manager Detection

The CLI automatically detects the package manager used to invoke it (npm, yarn, pnpm, bun) and uses the same for all operations.

## Testing Approach

Integration tests in `tests/integration/cli.test.ts` cover:
- Different project type combinations
- Feature selection scenarios
- File system operations
- Package.json modifications

Additional testing tools:
- `scripts/test-all-scenarios.ts` - Comprehensive end-to-end testing of all project configurations
- Run with options: `--keep-failed`, `--parallel`, `--debug`, `--save-logs`

## Important Notes

- The CLI builds to ESM format only
- Requires Node.js 18+
- Uses Biome for linting/formatting (not ESLint/Prettier)
- All paths in the codebase should use absolute paths, not relative
- The modular architecture (`index-modular.ts`) is the recommended approach
- Configuration files:
  - `config/transform-rules.json` - Defines file transformation rules
  - `config/feature-rules.json` - Defines feature dependencies and constraints
- When debugging, check debug output files in `test-*` directories

## Common Development Tasks

### Adding a New Feature Option

1. Add the option to `ProjectConfig` interface in `src/types/index.ts`
2. Update the CLI parser in `src/cli/parser.ts`
3. Create or modify processors in `src/processors/`
4. Add transformation rules to `config/transform-rules.json` if needed
5. Update tests in `tests/integration/cli.test.ts`

### Adding a New Processor

1. Create a new file in `src/processors/` implementing the `Processor` interface
2. Register it in `src/processors/registry.ts`
3. Ensure proper ordering relative to other processors

### Modifying Templates

1. Make changes in the appropriate `templates/` directory
2. Update `template.json` if adding new configurable features
3. Add transformation rules if files need conditional modifications