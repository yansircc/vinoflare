import type { NameVariations } from "../utils";

export const getReadmeTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `# ${pascal} Module

This is a self-contained module that follows the modular architecture pattern.

## 📁 Module Structure

\`\`\`
${kebab}/
├── __tests__/
│   ├── ${kebab}.test.ts       # Unit tests
│   └── ${kebab}.test-utils.ts # Test utilities
├── index.ts                   # Module entry point and public API exports
├── ${kebab}.table.ts          # Database table definition
├── ${kebab}.schema.ts         # Zod validation schemas
├── ${kebab}.types.ts          # TypeScript type definitions
├── ${kebab}.handlers.ts       # Business logic handlers
├── ${kebab}.routes.ts         # Route definitions
├── ${kebab}.openapi.ts        # OpenAPI documentation
└── README.md                  # This file
\`\`\`

## 🚀 Quick Start

The module is automatically registered when the application starts. No manual setup required!

### API Endpoints

- \`GET /api/${kebab}\` - Get all ${camel}
- \`GET /api/${kebab}/:id\` - Get ${camel} by ID
- \`POST /api/${kebab}\` - Create new ${camel}
- \`PUT /api/${kebab}/:id\` - Update ${camel}
- \`DELETE /api/${kebab}/:id\` - Delete ${camel}

## 🏗️ Architecture

### Self-Contained Design
All module code is contained within this directory, making it easy to:
- Develop independently
- Test in isolation
- Move or remove the entire feature
- Understand dependencies

### Type Safety
The module provides end-to-end type safety:
- Database types from Drizzle ORM
- Validation schemas from Zod
- API types for responses

### Exports
The module exports all its public APIs through \`index.ts\`:
\`\`\`typescript
import { ${camel}, select${pascal}Schema, type ${pascal} } from "@/server/modules/${kebab}";
\`\`\`

## 🔧 Development

### Adding New Fields

1. Add the field to \`${kebab}.table.ts\`
2. Update schemas in \`${kebab}.schema.ts\`
3. Update types if needed in \`${kebab}.types.ts\`
4. Run migrations:
   \`\`\`bash
   bun run db:generate
   bun run db:push:local
   \`\`\`

### Adding Business Logic

Update the handlers in \`${kebab}.handlers.ts\`:
- Add validation
- Implement filtering/pagination
- Add custom business rules

### Testing

Run tests with:
\`\`\`bash
bun test src/server/modules/${kebab}
\`\`\`

Tests are self-contained within the module:
- \`__tests__/${kebab}.test.ts\` - Test cases
- \`__tests__/${kebab}.test-utils.ts\` - Test utilities and setup

## 🔌 Integration Points

### Automatic Discovery
The module is automatically discovered and integrated:
- Database tables are collected from the module's \`tables\` property
- Routes are registered when the module is loaded
- No manual registration needed!

### Type Exports
Types are available through the module's public API:
\`\`\`typescript
import type { ${pascal}, Insert${pascal}, Update${pascal} } from "@/server/modules/${kebab}";
\`\`\`

## 📝 Notes

- Remember to run \`bun run gen:api\` after making changes to regenerate client types
- The module follows RESTful conventions
- All routes are protected by authentication by default (unless configured otherwise)
`;