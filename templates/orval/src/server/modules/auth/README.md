# Auth Module

This is a self-contained authentication module powered by Better Auth.

## 📁 Module Structure

```
auth/
├── index.ts              # Module entry point and public API exports
├── auth.table.ts         # Database table definitions (user, session, account, verification, jwks)
├── auth.schema.ts        # Zod validation schemas
├── auth.types.ts         # TypeScript type definitions
├── auth.handlers.ts      # Request handlers
├── auth.routes.ts        # Route definitions
├── auth.openapi.ts       # OpenAPI documentation
└── README.md            # This file
```

## 🚀 Quick Start

The module is automatically registered when the application starts. No manual setup required!

### API Endpoints

- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/discord` - Discord OAuth login
- `GET /api/auth/callback/discord` - Discord OAuth callback

## 🏗️ Architecture

### Self-Contained Design
All authentication-related code is contained within this directory, including:
- Database tables (user, session, account, verification, jwks)
- Validation schemas
- Type definitions
- Route handlers
- Better Auth integration

### Better Auth Integration
This module integrates with Better Auth to provide:
- Discord OAuth authentication
- Session management
- JWT token generation
- CSRF protection
- Rate limiting

### Type Safety
The module provides end-to-end type safety:
- Database types from Drizzle ORM
- Validation schemas from Zod
- Better Auth compatibility types

### Exports
The module exports all its public APIs through `index.ts`:
```typescript
import { user, session, selectUserSchema, type User } from "@/server/modules/auth";
```

## 🔧 Development

### Database Tables
The module defines 5 tables:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth provider accounts
- `verification` - Email verification tokens
- `jwks` - JWT signing keys

### Adding New OAuth Providers
1. Update Better Auth configuration in `src/server/lib/auth.ts`
2. Add environment variables for the new provider
3. Update the OpenAPI documentation

### Customizing User Model
1. Modify `auth.table.ts` to add new fields
2. Update schemas in `auth.schema.ts`
3. Update types in `auth.types.ts`
4. Run migrations:
   ```bash
   bun run db:generate
   bun run db:push:local
   ```

## 🔌 Integration Points

### Database
The tables are automatically included in the database schema through:
```typescript
// src/server/db/index.ts
import { user, session, account, verification, jwks } from "../modules/auth";
```

### API Routes
Routes are registered through the module system:
```typescript
// src/server/routes/api.ts
import authModule from "../modules/auth";
```

### Middleware
The auth middleware is available globally:
```typescript
// src/server/middleware/auth.ts
import { auth } from "../middleware/auth";
```

## 📝 Notes

- Authentication is handled by Better Auth
- Discord OAuth is the only authentication method enabled
- Sessions expire after 7 days by default
- All routes except those in PUBLIC_API_ROUTES require authentication
- The module is fully self-contained and can be moved/removed as needed