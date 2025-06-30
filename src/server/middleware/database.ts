import type { MiddlewareHandler } from "hono";
import { createModularDb, ModuleRegistry } from "../db/modular";
import type { BaseContext } from "../lib/worker-types";

export const database = (): MiddlewareHandler<BaseContext> => {
	return async (c, next) => {
		// Get modules from registry
		const modules = ModuleRegistry.getModules();

		// Create database with modules' tables
		const db = createModularDb(c.env.DB, modules);
		c.set("db", db);
		await next();
	};
};
