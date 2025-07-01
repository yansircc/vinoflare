#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
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
  - Zod validation schemas
  - CRUD handlers with in-memory storage
  - Routes with validation and OpenAPI docs
  - Module configuration
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

if (existsSync(paths.base)) {
	console.error(
		`Error: Module "${names.kebab}" already exists at ${paths.base}`,
	);
	process.exit(1);
}

generateModuleFiles(paths, names);

console.log(`\n🎆 Next Steps:`);
console.log(`   1. Update the schemas in ${names.kebab}.schema.ts`);
console.log(`   2. Generate API client:`);
console.log(`      bun run gen:api`);
console.log(`\n🚀 Your module will be available at /api/${names.kebab}`);
