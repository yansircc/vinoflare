import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import type { BaseContext } from "@/server/lib/worker-types";
import type { HelloResponse } from "./hello.schema";

export const helloHandler = async (c: Context<BaseContext>) => {
	const response: HelloResponse = {
		message: "Hello from API!",
		time: new Date().toISOString(),
	};

	return c.json(response, StatusCodes.OK);
};
