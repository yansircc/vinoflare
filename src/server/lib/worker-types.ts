export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: Record<string, never>;
}
