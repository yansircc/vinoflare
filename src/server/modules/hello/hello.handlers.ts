import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import type { BaseContext } from "@/server/lib/types";

export const helloHandler = async (c: Context<BaseContext>) => {
	return c.json(
		{ message: "Hello from API!", time: new Date().toISOString() },
		StatusCodes.OK,
	);
};
