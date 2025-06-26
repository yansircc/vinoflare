import type { ModuleDefinition } from "../../core/module-loader";
import { createPostsModule } from "./posts.routes";

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
