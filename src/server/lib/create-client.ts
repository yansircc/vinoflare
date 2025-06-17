import type { routes } from "@/index";
import { hc } from "hono/client";

const client = hc<(typeof routes)[number]>("/api");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<(typeof routes)[number]>(...args);
