# API Module Scaffolding

The project includes a scaffolding script to quickly generate new API modules with all the necessary boilerplate code.

## Usage

```bash
bun run scaffold:module <module-name>
```

## Features

The scaffolding script automatically:

1. Creates a new module directory under `src/server/modules/`
2. Generates three files with complete CRUD operations:
   - `*.handlers.ts` - Request handlers with database operations
   - `*.openapi.ts` - OpenAPI documentation specifications
   - `*.routes.ts` - Route definitions and module configuration
3. Updates `src/server/routes/api.ts` to register the new module

## Generated API Endpoints

Each scaffolded module includes:

- `GET /api/<module-name>` - Get all items
- `GET /api/<module-name>/:id` - Get item by ID
- `POST /api/<module-name>` - Create new item
- `PUT /api/<module-name>/:id` - Update existing item
- `DELETE /api/<module-name>/:id` - Delete item

## Options

- `-n, --name <name>` - Module name (can also be provided as positional argument)
- `-s, --schema <table>` - Database schema/table name (defaults to module name)
- `-h, --help` - Show help message

## Examples

```bash
# Basic usage
bun run scaffold:module products

# With custom schema name
bun run scaffold:module categories --schema category

# Using name flag
bun run scaffold:module -n orders -s order
```

## Post-Scaffolding Steps

After generating a module, you need to:

1. Create the database schema in `src/server/db/schema.ts`
2. Generate database types: `bun run db:generate`
3. Apply migrations if needed: `bun run db:migrate`

## Module Structure

Each generated module follows the project's architecture:

```
src/server/modules/<module-name>/
├── <module-name>.handlers.ts   # Business logic and database operations
├── <module-name>.openapi.ts    # OpenAPI specifications
└── <module-name>.routes.ts     # Route definitions using APIBuilder
```

## Customization

The generated code includes:

- Proper error handling with HTTPException
- Type-safe database operations using Drizzle ORM
- Automatic OpenAPI documentation
- Request validation using Zod schemas
- Consistent HTTP status codes
- Database middleware integration

Feel free to modify the generated code to fit your specific requirements.