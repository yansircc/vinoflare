import { StatusCodes } from "http-status-codes";
import { APIBuilder } from "@/server/lib/api-builder";
import { helloHandler } from "./hello.handlers";
import { helloResponseSchema } from "./hello.schema";

export const createHelloModule = () => {
	const builder = new APIBuilder();

	builder
		.get("/", helloHandler)
		.summary("Hello endpoint")
		.description("Returns a greeting message with the current timestamp")
		.tags("Greeting")
		.response(StatusCodes.OK, {
			description: "Greeting retrieved successfully",
			schema: helloResponseSchema,
		});

	return builder;
};
