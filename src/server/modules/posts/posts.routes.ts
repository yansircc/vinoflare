import { APIBuilder } from "@/server/lib/api-builder";
import { database } from "@/server/middleware/database";
import {
	createPostHandler,
	getLatestPostHandler,
	getPostByIdHandler,
} from "./posts.handlers";
import {
	createPostOpenAPI,
	getLatestPostOpenAPI,
	getPostByIdOpenAPI,
} from "./posts.openapi";
import { insertPostSchema, postIdSchema } from "./posts.schema";

export const createPostsModule = () => {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get latest post - with automatic date transformation
	builder.get("/latest", getLatestPostHandler).openapi(getLatestPostOpenAPI);

	// Create post
	builder
		.post("/", createPostHandler)
		.input(insertPostSchema, "body")
		.openapi(createPostOpenAPI);

	// Get post by ID - now with proper param validation
	builder
		.get("/:id", getPostByIdHandler)
		.input(postIdSchema, "params")
		.openapi(getPostByIdOpenAPI);

	return builder;
};
