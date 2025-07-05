/**
 * RPC-compatible routes for Hello module
 * This file exports Hono routes that can be used with hono/client
 */

import { Hono } from "hono";
import type { BaseContext } from "@/server/lib/worker-types";
import { helloHandler } from "./hello.handlers";

// Create RPC-compatible routes
export const helloRpcRoutes = new Hono<BaseContext>()
	// Basic hello endpoint - already a simple handler
	.get("/", helloHandler);

// Export the type
export type HelloRpcType = typeof helloRpcRoutes;
