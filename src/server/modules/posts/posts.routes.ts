import { StatusCodes } from "http-status-codes";
import { APIBuilder } from "@/server/core/api-builder";
import { database } from "@/server/middleware/database";
import {
	createPostHandler,
	getLatestPostHandler,
	getPostByIdHandler,
} from "./posts.handlers";
import {
	insertPostSchema,
	postIdSchema,
	postResponseSchema,
} from "./posts.schema";

export const createPostsModule = () => {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get latest post - with automatic date transformation
	builder
		.get("/latest", getLatestPostHandler)
		.summary("Get latest post")
		.description("Retrieves the most recent post")
		.tags("Post")
		.security([{ bearerAuth: [] }])
		.response(StatusCodes.OK, {
			description: "Post retrieved successfully",
			schema: postResponseSchema,
		})
		.response(StatusCodes.BAD_REQUEST, {
			description: "Bad request",
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "Not found",
		});

	// Create post
	builder
		.post("/", createPostHandler)
		.summary("Create a new post")
		.description("Creates a new post with the provided title")
		.tags("Post")
		.security([{ bearerAuth: [] }])
		.body(insertPostSchema)
		.response(StatusCodes.CREATED, {
			description: "Post created successfully",
			schema: postResponseSchema,
		})
		.response(StatusCodes.BAD_REQUEST, {
			description: "Invalid request - missing or invalid title",
		})
		.response(StatusCodes.CONFLICT, {
			description: "Post with this title already exists",
		});

	// Get post by ID - now with proper param validation
	builder
		.get("/:id", getPostByIdHandler)
		.summary("Get post by ID")
		.description("Retrieves a specific post by its ID")
		.tags("Post")
		.security([{ bearerAuth: [] }])
		.params({ id: postIdSchema })
		.response(StatusCodes.OK, {
			description: "Post retrieved successfully",
			schema: postResponseSchema,
		})
		.response(StatusCodes.BAD_REQUEST, {
			description: "Invalid ID parameter",
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "Post not found",
		});

	return builder;
};
