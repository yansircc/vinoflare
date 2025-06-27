import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import type { BaseEnv } from "@/server/lib/types";

export const helloHandler = async (c: Context<BaseEnv>) => {
	return c.json(
		{ message: "Hello from API!", time: new Date().toISOString() },		StatusCodes.OK,
	);
};
