import { drizzle } from "drizzle-orm/d1";
import type { ModuleDefinition } from "../core/module-loader";
import { collectModuleTables } from "../core/module-loader";

/**
 * Create a modular database instance with tables from all loaded modules
 * This allows modules to be self-contained with their own table definitions
 */
export function createModularDb(d1: D1Database, modules: ModuleDefinition[]) {
	// Collect all table definitions from modules
	const schema = collectModuleTables(modules);

	// Create drizzle instance with dynamic schema
	return drizzle(d1, { schema });
}

/**
 * Module registry to store loaded modules
 * This is used by the database middleware to create the database instance
 */
let registeredModules: ModuleDefinition[] = [];

export const ModuleRegistry = {
	register(modules: ModuleDefinition[]) {
		registeredModules = modules;
	},

	getModules(): ModuleDefinition[] {
		return registeredModules;
	},

	clear() {
		registeredModules = [];
	},
};
