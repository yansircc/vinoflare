#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { updateApiRoutes } from "./api-updater";
import { generateModuleFiles } from "./file-generator";
import { getNameVariations, getPaths } from "./utils";

// ... (argument parsing logic remains the same)

const { values, positionals } = parseArgs({
	args: process.argv.slice(2),
	options: {
		name: {
			type: "string",
			short: "n",
		},
		schema: {
			type: "string",
			short: "s",
		},
		help: {
			type: "boolean",
			short: "h",
		},
	},
	allowPositionals: true,
});

if (values.help || (!values.name && positionals.length === 0)) {
	console.log(`
Usage: bun run scaffold:module <module-name> [options]

Generate a complete CRUD module with handlers, routes, OpenAPI specs, and tests.

Arguments:
  module-name          Name of the module (e.g., "products", "user-profiles")

Options:
  -n, --name          Module name (alternative to positional argument)
  -s, --schema        Database schema name (defaults to module name)
  -h, --help          Show this help message

Examples:
  bun run scaffold:module products
  bun run scaffold:module user-profiles --schema userProfiles
  
This will generate:
  - Full CRUD operations (Create, Read, Update, Delete)
  - Type-safe handlers with error handling
  - OpenAPI documentation
  - Database integration with Drizzle ORM
  - Complete test suite
  - Automatic API registration
`);
	process.exit(0);
}

const moduleName = values.name || positionals[0];

if (!moduleName) {
	console.error("Error: Module name is required");
	process.exit(1);
}

// Validate module name
if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(moduleName)) {
	console.error(
		"Error: Module name must start with a letter and contain only letters, numbers, and hyphens",
	);
	process.exit(1);
}

const names = getNameVariations(moduleName);
const paths = getPaths(names.kebab);
const schemaName = values.schema || names.camel;

if (existsSync(paths.base)) {
	console.error(
		`Error: Module "${names.kebab}" already exists at ${paths.base}`,
	);
	process.exit(1);
}

generateModuleFiles(paths, names, schemaName);
updateApiRoutes(names);

console.log(`\n⚠️  Remember to:
   1. Create the "${schemaName}" table schema in src/server/db/schema.ts
   2. Generate/update the database schemas with "bun run db:generate"
   3. Run migrations if needed with "bun run db:migrate"
`);
console.log(`\n🚀 Your new module is ready to use at /api/${names.kebab}`);
