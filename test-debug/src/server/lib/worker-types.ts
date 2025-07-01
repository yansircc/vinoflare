import type { Database } from "../db";

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		db: Database;
	};
}
