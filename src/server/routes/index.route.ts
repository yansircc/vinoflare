import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { createRouter } from "@/server/lib/create-app";
import { z } from "zod";

const router = createRouter()
	.openapi(
		createRoute({
			tags: ["index"],
			method: "get",
			summary: "API",
			description: "API 信息端点",
			path: "/",
			responses: {
				[HttpStatusCodes.OK]: {
					description: "API 信息端点",
					content: {
						"application/json": {
							schema: z.object({
								name: z.string(),
								version: z.string(),
								description: z.string(),
								endpoints: z.object({
									auth: z.string(),
									tasks: z.string(),
									gallery: z.string(),
									kitchen: z.string(),
								}),
								timestamp: z.string(),
							}),
						},
					},
				},
			},
		}),
		(c) => {
			return c.json(
				{
					name: "VinoFlare API",
					version: "1.0.0",
					description: "Hono + Cloudflare Workers + Better Auth",
					endpoints: {
						auth: "/api/auth/*",
						posts: "/api/posts",
						tasks: "/api/tasks",
						gallery: "/api/gallery",
						kitchen: "/api/kitchen",
						health: "/health",
					},
					timestamp: new Date().toISOString(),
				},
				HttpStatusCodes.OK,
			);
		},
	)
	.openapi(
		createRoute({
			tags: ["health"],
			method: "get",
			summary: "Health",
			description: "健康检查端点",
			path: "/health",
			responses: {
				[HttpStatusCodes.OK]: {
					description: "健康检查端点",
					content: {
						"application/json": {
							schema: z.object({
								status: z.string(),
								timestamp: z.string(),
								version: z.string(),
								environment: z.string(),
							}),
						},
					},
				},
			},
		}),
		(c) => {
			return c.json({
				status: "healthy",
				timestamp: new Date().toISOString(),
				version: "1.0.0",
				environment: (c.env as any)?.NODE_ENV || "unknown",
			});
		},
	);

export default router;
