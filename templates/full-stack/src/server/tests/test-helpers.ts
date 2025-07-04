import { createApp } from "@/server/core/app-factory";
import type { ModuleDefinition } from "@/server/core/module-loader";

/**
 * Generic test app factory
 * Creates a Hono app with test configuration
 */
export function createTestApp(modules: ModuleDefinition[] = [], testEnv?: any) {
	return createApp({
		modules,
		middleware: {
			database: true,
			auth: true,
			trimSlash: true,
		},
		basePath: "/api",
		testEnv,
	});
}