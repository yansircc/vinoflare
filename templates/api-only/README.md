# Vino API Server

A modern API server built with Hono, Cloudflare Workers, and Drizzle ORM.

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Run type checking
bun typecheck

# Database commands
bun db:generate      # Generate migrations
bun db:push:local    # Apply migrations locally
bun db:studio        # Open Drizzle Studio

# Deploy to Cloudflare
bun deploy
```

## Project Structure

```
src/
├── server/
│   ├── modules/     # API modules (routes, handlers, OpenAPI specs)
│   ├── db/          # Database schema and migrations
│   ├── middleware/  # Hono middleware
│   └── lib/         # Shared utilities
└── index.ts         # Application entry point
```

## Features

- **Hono** - Fast, lightweight web framework
- **Cloudflare Workers** - Edge computing platform
- **Drizzle ORM** - Type-safe database ORM
- **Better Auth** - Authentication system
- **OpenAPI** - Auto-generated API documentation
- **Biome** - Fast formatter and linter
- **Vitest** - Unit testing framework