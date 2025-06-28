import { StatusCodes } from "http-status-codes";

// Define post schema manually to avoid z.toJSONSchema issues
const postSchema = {
	type: "object",
	properties: {
		id: { type: "integer", example: 1 },
		title: { type: "string", example: "My First Post" },
		createdAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
		updatedAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
	},
	required: ["id", "title", "createdAt", "updatedAt"],
};

const insertPostBodySchema = {
	type: "object",
	properties: {
		title: { 
			type: "string", 
			minLength: 1,
			maxLength: 255,
			example: "My First Post" 
		},
	},
	required: ["title"],
};

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
			schema: insertPostBodySchema,
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
