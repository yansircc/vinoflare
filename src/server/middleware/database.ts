import type { MiddlewareHandler } from "hono";
import type { BaseContext } from "../core/worker-types";
import { createDb } from "../db";

export const database = (): MiddlewareHandler<BaseContext> => {
	return async (c, next) => {
		const db = createDb(c.env.DB);
		c.set("db", db);
		await next();
	};
};
