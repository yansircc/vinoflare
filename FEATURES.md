# Create Vino App - Features & Improvements

## Overview

`create-vino-app` is a modern CLI tool for scaffolding full-stack TypeScript applications built with:
- **Hono** - Fast, lightweight web framework for Cloudflare Workers
- **TanStack Router** - Type-safe routing for React
- **D1 Database** (optional) - Cloudflare's SQLite database
- **Better Auth** (optional) - Authentication solution
- **Drizzle ORM** - Type-safe database toolkit

## Key Features

### 1. Project Types
- **Full-stack**: Hono API + React frontend with TanStack Router
- **API-only**: Just the Hono API server

### 2. Flexible Architecture Options
- **D1 Database**: Optional SQLite database integration
- **Better Auth**: Optional authentication (requires database)
- **Modular structure**: Easy to extend with new features

### 3. Interactive & Non-Interactive Modes

#### Interactive Mode
```bash
bunx create-vino-app my-app
```
- Guided prompts for all configuration options
- **NEW**: Collects all choices upfront before executing
- Shows configuration summary with confirmation

#### Non-Interactive Mode
```bash
# Full-stack with all features
bunx create-vino-app my-app -y

# API-only without database
bunx create-vino-app my-api --type=api-only --no-db -y

# Full-stack with DB but no auth
bunx create-vino-app my-app --no-auth -y
```

### 4. Command-Line Options
```
-y, --yes              Skip all prompts and use defaults
--type=<type>          Project type: full-stack or api-only
--no-db                Skip D1 Database
--no-auth              Skip Better Auth (requires database)
--no-install           Skip dependency installation
--no-git               Skip git initialization
--skip-init            Skip project initialization
--pm=<pm>              Package manager: npm, yarn, pnpm, or bun
-h, --help             Show help message
```

### 5. Smart Dependency Management
- Automatically detects package manager (bun, npm, yarn, pnpm)
- Only includes necessary dependencies based on features
- Removes unused database/auth packages when not needed

### 6. Intelligent File Processing
- Removes unnecessary files based on selected features
- Updates imports and type definitions automatically
- Maintains clean, working code for any configuration

### 7. Project Configurations

#### Full-stack with DB and Auth
- Complete authentication system with Discord OAuth
- Database with posts example
- User session management
- Protected API routes

#### Full-stack with DB, no Auth
- Database integration without authentication
- Public API endpoints
- Posts module without user association

#### Full-stack Minimal (no DB, no Auth)
- Simple hello API endpoint
- Minimal dependencies
- Clean starting point

#### API-only Variants
- Same options as full-stack but without React frontend
- Optimized for API development
- Smaller bundle size

## Architecture Improvements

### 1. Modular Design
- Separated concerns into processors and transformers
- Configuration-driven approach
- Easy to extend with new features

### 2. Type Safety
- Proper TypeScript types for all configurations
- BaseContext vs BaseEnv based on features
- Clean type exports

### 3. Safe Code Generation
- No eval() usage
- Template-based file generation
- Regex-based file transformations

### 4. Testing Support
- Unit tests for modules
- Test script for all combinations
- Continuous validation

## Usage Examples

### Create a Full-featured App
```bash
bunx create-vino-app my-app
# Select: Full-stack
# Include D1: Yes
# Include Auth: Yes
```

### Create a Minimal API
```bash
bunx create-vino-app my-api --type=api-only --no-db -y
```

### Create Full-stack with Database Only
```bash
bunx create-vino-app my-app --no-auth -y
```

## Project Structure

```
my-app/
├── src/
│   ├── client/          # React frontend (full-stack only)
│   │   ├── components/
│   │   ├── lib/
│   │   └── routes/
│   └── server/          # Hono API
│       ├── config/
│       ├── db/          # Database (if included)
│       ├── lib/
│       ├── middleware/
│       ├── modules/     # API modules
│       ├── openapi/
│       ├── schemas/
│       └── types/
├── public/
├── scripts/
├── .dev.vars           # Environment variables
├── drizzle.config.ts   # Database config (if included)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml       # Cloudflare Workers config
```

## Development Workflow

1. **Create Project**
   ```bash
   bunx create-vino-app my-app
   ```

2. **Start Development**
   ```bash
   cd my-app
   bun run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:5173
   - API: http://localhost:5173/api
   - API Docs: http://localhost:5173/api/docs

## Testing

Run the test script to validate all combinations:
```bash
./test-all-combinations.sh
```

This will create and build all possible project configurations to ensure everything works correctly.