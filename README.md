# create-vinoflare

A modern CLI tool to scaffold full-stack TypeScript applications with Hono and TanStack Router, featuring flexible architecture options and smart dependency management.

## Features

- 🚀 **Hono** - Fast, lightweight web framework for Cloudflare Workers
- ⚛️ **React + TanStack Router** - Type-safe routing for React applications
- 🔐 **Better Auth** - Comprehensive authentication solution (optional)
- 📦 **D1 Database** - Cloudflare's SQLite database with Drizzle ORM (optional)
- 📝 **TypeScript** - Full type safety with strict mode
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🛠️ **Vite** - Lightning-fast build tool
- 🎯 **Modular Architecture** - Clean, extensible project structure
- 🔧 **Smart Defaults** - Intelligent feature detection and configuration

## Quick Start

```bash
# Interactive mode (recommended)
bunx create-vinoflare my-app

# Non-interactive with defaults
bunx create-vinoflare my-app -y

# API-only without database
bunx create-vinoflare my-api --type=api-only --no-db -y

# Full-stack with database but no auth
bunx create-vinoflare my-app --no-auth -y
```

### Package Manager Support

```bash
# Using npm
npx create-vinoflare@latest my-app

# Using bun (recommended)
bunx create-vinoflare@latest my-app

# Using pnpm
pnpm create vinoflare@latest my-app

# Using yarn
yarn create vinoflare my-app
```

## Command-Line Options

```
-y, --yes              Skip all prompts and use defaults
--type=<type>          Project type: full-stack or api-only (default: full-stack)
--no-db                Skip D1 Database integration
--no-auth              Skip Better Auth (requires database)
--no-install           Skip dependency installation
--no-git               Skip git repository initialization
--skip-init            Skip project initialization (type generation, etc.)
--pm=<pm>              Force package manager: npm, yarn, pnpm, or bun
-h, --help             Show help message
```

## Interactive Options

When running in interactive mode, you'll be prompted to configure:

1. **Project name** - Your application name
2. **Project type** - Full-stack app or API server only
3. **D1 Database** - Include Cloudflare D1 database integration
4. **Better Auth** - Include authentication (requires database)
5. **Install dependencies** - Install packages automatically
6. **Initialize project** - Generate types and run setup commands
7. **Git repository** - Initialize git and create first commit

All options are collected upfront before any actions are executed, with a confirmation summary.

## Project Configurations

### Full-stack with All Features (default)
- Hono API + React frontend
- D1 Database with Drizzle ORM
- Better Auth with Discord OAuth
- Posts module example
- Protected routes

### Full-stack with Database Only
- Hono API + React frontend
- D1 Database with Drizzle ORM
- No authentication
- Public API endpoints

### Full-stack Minimal
- Hono API + React frontend
- No database or authentication
- Simple hello endpoint
- Minimal dependencies

### API-only Variants
- Same options as full-stack
- No React frontend
- Optimized for API development
- Smaller deployment size

## Development

After creating your project:

```bash
cd my-app
bun run dev
```

Your app will be available at:
- Frontend: http://localhost:5173 (full-stack only)
- API: http://localhost:5173/api
- API Docs: http://localhost:5173/api/docs

### Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run deploy       # Deploy to Cloudflare Workers
bun run typecheck    # Run TypeScript type checking
bun run lint         # Run linter
bun run format       # Format code

# If database is included:
bun run db:generate  # Generate database migrations
bun run db:push      # Apply migrations
bun run db:studio    # Open Drizzle Studio

# If full-stack:
bun run gen:routes   # Generate TanStack Router types
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

## Architecture Details

Based on your choices, the CLI will automatically:

### Without Database
- Remove all database-related files and dependencies
- Remove Drizzle ORM configuration
- Remove database middleware
- Remove `db:*` commands from package.json
- Use minimal type definitions (BaseEnv)
- Include only simple API endpoints

### Without Auth (when database is included)
- Remove Better Auth integration
- Remove auth middleware and guards
- Remove auth-related API endpoints
- Remove login/profile pages (full-stack)
- Keep database for other features
- Update type definitions accordingly

### Smart File Processing
- Updates imports and exports automatically
- Removes unused dependencies from package.json
- Adjusts TypeScript types based on features
- Maintains clean, working code for any configuration

## Testing

Run the included test script to validate all combinations:

```bash
cd create-vinoflare
./test-all-combinations.sh
```

This will create and build all possible project configurations.

## Local Development

To work on the CLI itself:

```bash
# Clone the repository
git clone <repo-url>
cd create-vinoflare

# Install dependencies
bun install

# Build the CLI
bun run build

# Link for local testing
bun link

# Test locally
bunx create-vinoflare test-app
```

## Contributing

Contributions are welcome! The codebase features:
- Modular architecture for easy extension
- Comprehensive type definitions
- Extensive testing support
- Clear separation of concerns

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details on the codebase structure.

## License

MIT