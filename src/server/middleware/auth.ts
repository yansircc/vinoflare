import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createAuth } from "../lib/auth";

const authMiddleware = createMiddleware(async (c, next) => {
	const session = await createAuth(
		c.env as CloudflareBindings,
		c.req.raw.url,
	).api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	c.set("user", session.user);
	c.set("session", session.session);
	return next();
});

export default authMiddleware;
