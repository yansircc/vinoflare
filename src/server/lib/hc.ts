import type { AppType } from "@/index";
import { hc } from "hono/client";

// Pre-calculate the type at compile time for better performance
const client = hc<AppType>("");
export type Client = typeof client;

// Export the typed client factory function
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<AppType>(...args);

// Optimized typed clients for specific route groups (split to improve IDE performance)
export const createApiClient = (baseUrl: string) => {
	const fullClient = hc<AppType>(baseUrl);
	return fullClient.api;
};

export const createTasksClient = (baseUrl: string) => {
	const fullClient = hc<AppType>(baseUrl);
	// Since tasks are nested under /api/tasks, we need to access them correctly
	return fullClient.api;
};