import type { ModuleDefinition } from "../../core/module-loader";
import { createPostsModule } from "./posts.routes";
import { posts } from "./posts.table";

export * from "./posts.handlers";
export * from "./posts.schema";
// Export all public APIs from this module
export { posts } from "./posts.table";

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
	// Self-contained table definitions
	tables: {
		posts,
	},
};

export default postsModule;
