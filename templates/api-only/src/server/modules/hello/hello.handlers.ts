import type { BaseContext } from "@/server/lib/types";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";

export const helloHandler = async (c: Context<BaseContext>) => {
	return c.json(
		{
			success: true,
			data: { message: "Hello from API!", time: new Date().toISOString() },
		},
		StatusCodes.OK,
	);
};
