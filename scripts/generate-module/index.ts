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
		help: {
			type: "boolean",
			short: "h",
		},
	},
	allowPositionals: true,
});

if (values.help || (!values.name && positionals.length === 0)) {
	console.log(`
Usage: bun run gen:module <module-name> [options]

Generate a CRUD module scaffold with handlers, routes, and OpenAPI specs.

Arguments:
  module-name          Name of the module (e.g., "products", "user-profiles")

Options:
  -n, --name          Module name (alternative to positional argument)
  -h, --help          Show this help message

Examples:
  bun run gen:module products
  bun run gen:module user-profiles
  
This will generate a self-contained module with:
  - Database table definition
  - Zod validation schemas  
  - TypeScript type definitions
  - CRUD handlers with error handling
  - OpenAPI documentation
  - Routes with validation
  - Module configuration
  - README with documentation
  - Test file structure
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

generateModuleFiles(paths, names);
updateApiRoutes(names);

console.log(`\n🎆 Next Steps:`);
console.log(`   1. Update the table definition in ${names.kebab}.table.ts`);
console.log(`   2. Adjust the schemas in ${names.kebab}.schema.ts`);
console.log(`   3. Run database migrations:`);
console.log(`      bun run db:generate`);
console.log(`      bun run db:push:local`);
console.log(`   4. Update src/server/db/index.ts to include the ${names.camel} table`);
console.log(`   5. Import the module in src/server/routes/api.ts`);
console.log(`\n📚 See ${paths.base}/README.md for detailed documentation`);
console.log(`\n🚀 Your module will be available at /api/${names.kebab}`);
