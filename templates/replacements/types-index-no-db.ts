// Type definitions for API-only projects without database

// Context types
export interface CloudflareBindings {
	ENVIRONMENT: string;
}

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {};
}