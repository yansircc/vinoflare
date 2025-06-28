import { createApp } from "@/server/core/app-factory";
import type { ModuleDefinition } from "@/server/core/module-loader";

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

export async function createAuthenticatedRequest(
	path: string,
	options: RequestInit = {},
) {
	return new Request(`http://localhost${path}`, options);
}
