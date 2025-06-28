import type { Database } from "../db";
import type { InsertUser, InsertSession } from "../modules/auth";

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		db: Database;
		user?: InsertUser;
		session?: InsertSession;
	};
}
