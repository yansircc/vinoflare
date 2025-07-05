import type { ModuleDefinition } from "../../core/module-loader";
import { createAuthModule } from "./auth.routes";
import { account, jwks, session, user, verification } from "./auth.table";

// Export handlers
export * from "./auth.handlers";
// Export all schemas
export * from "./auth.schema";
// Export all auth tables
export { account, jwks, session, user, verification } from "./auth.table";

const authModule: ModuleDefinition = {
	name: "auth",
	basePath: "/auth",
	createModule: createAuthModule,
	metadata: {
		version: "1.0.0",
		tags: ["Authentication"],
		security: ["public", "authenticated"],
	},
	// Self-contained table definitions
	tables: {
		user,
		session,
		account,
		verification,
		jwks,
	},
};

export default authModule;
