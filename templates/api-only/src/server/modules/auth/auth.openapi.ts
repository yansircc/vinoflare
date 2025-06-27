import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";
import { selectUserSchema } from "@/server/schemas";

const userSchema = z.toJSONSchema(selectUserSchema);

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
