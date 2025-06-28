import type { ModuleDefinition } from "../../core/module-loader";
import { createAuthModule } from "./auth.routes";

// Export handlers
export * from "./auth.handlers";
// Export OpenAPI definitions
export * from "./auth.openapi";
// Export all schemas
export * from "./auth.schema";
// Export all auth tables
export { account, jwks, session, user, verification } from "./auth.table";
// Export all types
export * from "./auth.types";

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
