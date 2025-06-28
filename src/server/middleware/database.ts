import type { MiddlewareHandler } from "hono";
import { createDb } from "../db";
import type { BaseContext } from "../lib/worker-types";

export const database = (): MiddlewareHandler<BaseContext> => {
	return async (c, next) => {
		const db = createDb(c.env.DB);
		c.set("db", db);
		await next();
	};
};
