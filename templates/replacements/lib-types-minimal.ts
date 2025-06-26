import type { Context } from "hono";

interface Variables {
	// No database or auth in minimal setup
	[key: string]: unknown;
}

export interface Env {
	Bindings: CloudflareBindings;
	Variables: Variables;
}

export interface BaseEnv {
	Bindings: CloudflareBindings;
}

export type AppContext = Context<Env>;
export type BaseContext = BaseEnv;
