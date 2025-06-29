import type { ModuleDefinition } from "../../core/module-loader";
import { createPostsRoutes } from "./posts.routes";

export * from "./posts.handlers";
export * from "./posts.schema";
// Export all public APIs from this module
export { posts } from "./posts.table";

// Module definition
const postsModule: ModuleDefinition = {
	name: "posts",
	basePath: "/posts",
	createModule: createPostsRoutes,
	metadata: {
		version: "1.0.0",
		tags: ["Posts"],
		security: ["public", "authenticated"],
	},
};

export default postsModule;
