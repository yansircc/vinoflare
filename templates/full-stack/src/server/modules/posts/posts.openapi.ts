import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";
import {
	insertPostSchema,
	selectPostSchema,
} from "@/server/schemas/database/posts";

const postSchema = z.toJSONSchema(selectPostSchema);

// Define the response wrapper schema
const postResponseSchema = {
	type: "object",
	properties: {
		post: postSchema,
	},
	required: ["post"],
};

export const getLatestPostOpenAPI = {
	tags: ["Posts"],
	summary: "Get latest post",
	description: "Retrieves the most recently created post",
	responses: {
		[StatusCodes.OK]: {
			description: "Latest post retrieved successfully",
			schema: postResponseSchema,
		},
	},
};

export const createPostOpenAPI = {
	tags: ["Posts"],
	summary: "Create a new post",
	description: "Creates a new post with the provided data",
	request: {
		body: {
			description: "Post data",
			schema: z.toJSONSchema(insertPostSchema),
		},
	},
	responses: {
		[StatusCodes.CREATED]: {
			description: "Post created successfully",
			schema: postResponseSchema,
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Validation error",
		},
		[StatusCodes.CONFLICT]: {
			description: "Post conflict",
		},
		[StatusCodes.INTERNAL_SERVER_ERROR]: {
			description: "Internal server error",
		},
	},
};

export const getPostByIdOpenAPI = {
	tags: ["Posts"],
	summary: "Get post by ID",
	description: "Retrieves a specific post by its ID",
	request: {
		params: [
			{
				name: "id",
				description: "Post ID",
				required: true,
				schema: { type: "integer" },
			},
		],
	},
	responses: {
		[StatusCodes.OK]: {
			description: "Post retrieved successfully",
			schema: postResponseSchema,
		},
		[StatusCodes.NOT_FOUND]: {
			description: "Post not found",
		},
		[StatusCodes.INTERNAL_SERVER_ERROR]: {
			description: "Internal server error",
		},
	},
};
