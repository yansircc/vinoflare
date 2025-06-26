import { StatusCodes } from "http-status-codes";

export const helloOpenAPI = {
	tags: ["Hello"],
	summary: "Hello endpoint",
	description: "Returns a greeting message with current timestamp",
	responses: {
		[StatusCodes.OK]: {
			description: "Greeting message with current timestamp",
			schema: {
				type: "object",
				properties: {
					message: {
						type: "string",
						description: "Greeting message",
						example: "Hello from API!",
					},
					time: {
						type: "string",
						format: "date-time",
						description: "Current timestamp",
						example: "2024-01-01T00:00:00.000Z",
					},
				},
				required: ["message", "time"],
			},
		},
	},
};
