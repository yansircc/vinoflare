import { createMiddleware } from "hono/factory";

export const trimSlash = createMiddleware(async (c, next) => {
	const url = new URL(c.req.url);
	if (url.pathname !== "/" && url.pathname.endsWith("/")) {
		url.pathname = url.pathname.slice(0, -1);
		return c.redirect(url.toString(), 301);
	}
	await next();
});
