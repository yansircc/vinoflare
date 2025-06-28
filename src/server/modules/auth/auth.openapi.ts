import { StatusCodes } from "http-status-codes";

// Define user schema manually to avoid z.toJSONSchema issues
const userSchema = {
	type: "object",
	properties: {
		id: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
		name: { type: "string", example: "John Doe" },
		email: { type: "string", format: "email", example: "john@example.com" },
		emailVerified: { type: "boolean", example: true },
		image: {
			type: "string",
			nullable: true,
			example: "https://example.com/image.png",
		},
		createdAt: { type: "string", format: "date-time" },
		updatedAt: { type: "string", format: "date-time" },
	},
	required: ["id", "name", "email", "emailVerified", "createdAt", "updatedAt"],
};

// Define the response wrapper schema
const userResponseSchema = {
	type: "object",
	properties: {
		user: userSchema,
	},
	required: ["user"],
};

export const getCurrentUserOpenAPI = {
	tags: ["Authentication"],
	summary: "Get current user",
	description: "Returns the currently authenticated user",
	responses: {
		[StatusCodes.OK]: {
			description: "Current user information",
			schema: userResponseSchema,
		},
		[StatusCodes.UNAUTHORIZED]: {
			description: "Unauthorized",
		},
		[StatusCodes.FORBIDDEN]: {
			description: "Forbidden",
		},
	},
};
