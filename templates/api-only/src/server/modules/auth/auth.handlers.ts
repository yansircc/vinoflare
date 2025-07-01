import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import { createAuth } from "@/server/lib/auth";
import type { BaseContext } from "@/server/lib/worker-types";

// Export Auth handler from better-auth
export const authHandler = async (c: Context<BaseContext>) => {
	const auth = await createAuth(c.env, new URL(c.req.url).origin);
	return auth.handler(c.req.raw);
};

// Get current user handler
export const getCurrentUserHandler = async (c: Context<BaseContext>) => {
	const user = c.get("user");

	// Using throwError for cleaner error handling
	if (!user) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED, {
			message: "Not authenticated",
		});
	}

	return c.json({ user }, StatusCodes.OK);
};
