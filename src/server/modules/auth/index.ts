import type { ModuleDefinition } from "../../core/module-loader";
import { createAuthModule } from "./auth.routes";

// Export all auth tables
export { user, session, account, verification, jwks } from "./auth.table";

// Export all schemas
export * from "./auth.schema";

// Export all types
export * from "./auth.types";

// Export handlers
export * from "./auth.handlers";

// Export OpenAPI definitions
export * from "./auth.openapi";

const authModule: ModuleDefinition = {
	name: "auth",
	basePath: "/auth",
	createModule: createAuthModule,
	metadata: {
		version: "1.0.0",
		tags: ["Authentication"],
		security: ["public", "authenticated"],
	},
};

export default authModule;
