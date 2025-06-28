/// <reference path="../../../worker-configuration.d.ts" />

import type { Database } from "../db";
import type { User, Session } from "../modules/auth";

// Better Auth returns these with Date objects instead of timestamps
// and optional fields can be undefined instead of null
export type AuthUser = Omit<User, "createdAt" | "updatedAt" | "image"> & {
	createdAt: Date;
	updatedAt: Date;
	image?: string | null;
};
export type AuthSession = Omit<Session, "createdAt" | "updatedAt" | "expiresAt" | "ipAddress" | "userAgent"> & {
	createdAt: Date;
	updatedAt: Date;
	expiresAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
};

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		db: Database;
		user?: AuthUser;
		session?: AuthSession;
	};
}
