import type { ModuleDefinition } from "../../core/module-loader";
import { createAuthModule } from "./auth.routes";

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
