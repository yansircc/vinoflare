import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { PUBLIC_API_ROUTES } from "../config/routes";
import { createAuth } from "../core/auth";
import type { BaseContext } from "../core/worker-types";

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

	// In test environment, automatically authenticate with test user
	if (c.env?.ENVIRONMENT === "test") {
		// Set test user and session
		c.set("user", {
			id: "test-user-id",
			name: "Test User",
			email: "test@example.com",
			emailVerified: false,
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		c.set("session", {
			id: "test-session-id",
			userId: "test-user-id",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			token: "test-session-token",
			createdAt: new Date(),
			updatedAt: new Date(),
			userAgent: "test-agent",
			ipAddress: "127.0.0.1",
		});
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
