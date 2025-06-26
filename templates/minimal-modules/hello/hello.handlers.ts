import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import type { BaseEnv } from "@/server/lib/types";

export const helloHandler = async (c: Context<BaseEnv>) => {
	return c.json(
		{
			success: true,
			data: { message: "Hello from API!", time: new Date().toISOString() },
		},
		StatusCodes.OK,
	);
};