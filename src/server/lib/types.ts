/// <reference path="../../../worker-configuration.d.ts" />

import type { Database } from "../db";
import type { AuthSession, AuthUser } from "../types";

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		db: Database;
		user?: AuthUser;
		session?: AuthSession;
	};
}
