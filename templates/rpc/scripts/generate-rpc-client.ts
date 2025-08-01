#!/usr/bin/env bun
/**
 * Generate Standalone RPC Client
 * This version generates a complete client without needing rpc-exports.ts
 * It creates the combined type directly in the client file
 */

import { existsSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { glob } from "glob";

const PROJECT_ROOT = join(import.meta.dir, "..");
const MODULES_DIR = join(PROJECT_ROOT, "src/server/modules");
const OUTPUT_DIR = join(PROJECT_ROOT, "src/generated");
const OUTPUT_FILE = join(OUTPUT_DIR, "rpc-client.ts");

interface ModuleInfo {
	name: string;
	pascalCase: string;
	importPath: string;
	routesName: string;
	typeName: string;
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
	return str
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

/**
 * Get module name from file path
 */
function getModuleName(filePath: string): string {
	const relativePath = relative(MODULES_DIR, filePath);
	const parts = relativePath.split("/");
	return parts[0];
}

/**
 * Scan for all .rpc.ts files
 */
async function scanRpcFiles(): Promise<ModuleInfo[]> {
	const pattern = join(MODULES_DIR, "*/*.rpc.ts");
	const files = await glob(pattern);
	
	const modules: ModuleInfo[] = [];
	const seenModules = new Set<string>();

	for (const filePath of files) {
		const moduleName = getModuleName(filePath);
		
		if (seenModules.has(moduleName)) {
			continue;
		}
		
		if (moduleName.includes("test") || moduleName.includes("example")) {
			continue;
		}

		seenModules.add(moduleName);
		
		const pascalCase = toPascalCase(moduleName);
		
		modules.push({
			name: moduleName,
			pascalCase,
			importPath: `@/server/modules/${moduleName}/${moduleName}.rpc`,
			routesName: `${moduleName}RpcRoutes`,
			typeName: `${pascalCase}RpcType`,
		});
	}

	return modules.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Generate the standalone client file content
 */
function generateClientContent(modules: ModuleInfo[]): string {
	if (modules.length === 0) {
		return `/**
 * Auto-generated RPC Client
 * No RPC modules found. Create a .rpc.ts file in a module to enable RPC.
 */

export const apiClient = {} as const;
`;
	}

	// Generate imports
	const imports = modules
		.map(
			(m) =>
				`import { ${m.routesName}, type ${m.typeName} } from "${m.importPath}";`
		)
		.join("\n");

	// Generate route registrations
	const routes = modules
		.map((m) => `\t.route("/${m.name}", ${m.routesName})`)
		.join("\n");

	// Generate type exports
	const typeExports = modules.map((m) => m.typeName).join(", ");

	return `/**
 * Auto-generated Standalone RPC Client
 * This file is automatically generated by scripts/generate-rpc-client.ts
 * DO NOT EDIT MANUALLY - Run 'bun run gen:client' to regenerate
 * 
 * Generated at: ${new Date().toISOString()}
 */

import { Hono } from "hono";
import { hc } from "hono/client";
import type { BaseContext } from "@/server/lib/worker-types";

// Import all RPC routes and types
${imports}

// Build the combined app type inline (no need for rpc-exports.ts!)
const _combinedApp = new Hono<BaseContext>()
${routes};

// Create the main API client
export const apiClient = hc<typeof _combinedApp>("/api");

// Re-export the type for convenience
export type ApiClient = typeof apiClient;

// Export individual module types for advanced usage
export type { ${typeExports} };

/* Usage Examples:

// Direct usage (no 'index' needed!)
const todos = await apiClient.todo.$get();
const hello = await apiClient.hello.$get();

// Using helper functions
const todos = await todo.get();
const newTodo = await todo.post({ json: { title: "New Task" } });
const specificTodo = await todo.byId(123).get();

*/`;
}

/**
 * Main function
 */
async function main() {
	console.log("🔍 Scanning for RPC modules...");
	
	const modules = await scanRpcFiles();
	
	if (modules.length === 0) {
		console.log("⚠️  No RPC modules found");
		return;
	}

	console.log(`✅ Found ${modules.length} RPC modules:`);
	for (const module of modules) {
		console.log(`   - ${module.name}`);
	}

	// Ensure output directory exists
	if (!existsSync(OUTPUT_DIR)) {
		mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Generate and write the client file
	const content = generateClientContent(modules);
	await Bun.write(OUTPUT_FILE, content);

	console.log(`\n✨ Generated standalone RPC client at:`);
	console.log(`   ${relative(PROJECT_ROOT, OUTPUT_FILE)}`);
	console.log(`\n🎉 No rpc-exports.ts needed!`);
	console.log(`\n📝 Usage examples:`);
	console.log(`   import { apiClient, todo } from "@/generated/rpc-client";`);
	console.log(`   `);
	console.log(`   // Direct usage (no 'index' needed!)`);
	console.log(`   const todos = await apiClient.todo.$get();`);
	console.log(`   `);
	console.log(`   // Using helper functions`);
	console.log(`   const todos = await todo.get();`);
}

// Run the script
main().catch((error) => {
	console.error("❌ Error generating RPC client:", error);
	process.exit(1);
});