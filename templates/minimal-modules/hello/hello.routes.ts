import { APIBuilder } from "@/server/lib/api-builder";
import { helloHandler } from "./hello.handlers";
import { helloOpenAPI } from "./hello.openapi";

export const createHelloModule = () => {
	const builder = new APIBuilder();

	builder.addRoute({
		method: "get",
		path: "/",
		handler: helloHandler,
		openapi: helloOpenAPI,
	});

	return builder;
};
