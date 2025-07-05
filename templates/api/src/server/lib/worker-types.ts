import type { Database } from "../db";
import type { InsertSession, InsertUser } from "../modules/auth";

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		db: Database;
		user?: InsertUser;
		session?: InsertSession;
	};
}
