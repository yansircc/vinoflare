import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { PUBLIC_API_ROUTES } from "../config/routes";
import { createAuth } from "../lib/auth";
import type { BaseContext } from "../lib/types";

/**
 * Check if a path matches any of the public route patterns
 */
function isPublicRoute(path: string): boolean {
	return PUBLIC_API_ROUTES.some((pattern) => {
		// Convert route pattern to regex
		const regex = new RegExp(
			"^" + pattern.replace(/\*/g, ".*").replace(/\//g, "\\/") + "$",
		);
		return regex.test(path);
	});
}

/**
 * Authentication guard middleware
 * Automatically protects all routes except those defined in PUBLIC_API_ROUTES
 */
export const authGuard = createMiddleware<BaseContext>(async (c, next) => {
	const path = c.req.path;

	// Skip authentication for public routes
	if (isPublicRoute(path)) {
		return next();
	}

	// Check authentication
	const session = await createAuth(c.env, c.req.raw.url).api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	// Set user and session in context
	c.set("user", session.user);
	c.set("session", session.session);

	return next();
});
