import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
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
import { insertPostSchema } from "./posts.schema";

export const createPostsModule = () => {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get latest post - with automatic date transformation
	builder.addRoute({
		method: "get",
		path: "/latest",
		handler: getLatestPostHandler,
		openapi: getLatestPostOpenAPI,
	});

	// Create post
	builder.addRoute({
		method: "post",
		path: "/",
		validation: {
			body: insertPostSchema,
		},
		handler: async (c, input) => createPostHandler(c, input),
		openapi: createPostOpenAPI,
	});

	// Get post by ID - example of additional route
	builder.addRoute({
		method: "get",
		path: "/:id",
		handler: async (c) => {
			const idParam = c.req.param("id");
			const id = Number.parseInt(idParam);

			// Validate ID
			if (Number.isNaN(id) || id <= 0 || !Number.isInteger(Number(idParam))) {
				throw new HTTPException(StatusCodes.BAD_REQUEST, {
					message: "Invalid ID parameter",
					cause: { code: "INVALID_ID" },
				});
			}

			return getPostByIdHandler(c, id);
		},
		openapi: getPostByIdOpenAPI,
	});

	return builder;
};
