import type { ModuleDefinition } from "../../core/module-loader";
import { createPostsModule } from "./posts.routes";

// Export all public APIs from this module
export { posts } from "./posts.table";
export * from "./posts.schema";
export * from "./posts.types";
export * from "./posts.handlers";
export * from "./posts.openapi";

// Module definition
const postsModule: ModuleDefinition = {
	name: "posts",
	basePath: "/posts",
	createModule: createPostsModule,
	metadata: {
		version: "1.0.0",
		tags: ["Posts"],
		security: ["public", "authenticated"],
	},
};

export default postsModule;
