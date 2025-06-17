import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AuthSession, AuthUser } from "@/server/db/schema";
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
									tasks: z.string(),
									health: z.string(),
									me: z.string(),
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
						tasks: "/api/tasks",
						health: "/api/health",
						me: "/api/me",
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
				environment: (c.env as any)?.ENVIRONMENT || "unknown",
			});
		},
	)
	.openapi(
		createRoute({
			tags: ["me"],
			method: "get",
			summary: "Get me",
			description: "Get me",
			path: "/me",
			responses: {
				[HttpStatusCodes.OK]: {
					description: "Get me",
					content: {
						"application/json": {
							schema: z.object({
								user: z
									.object({
										id: z.string(),
										name: z.string(),
										email: z.string(),
										emailVerified: z.boolean(),
										image: z.string().nullable(),
										createdAt: z.date(),
										updatedAt: z.date(),
									})
									.nullable(),
								session: z
									.object({
										id: z.string(),
										userId: z.string(),
										userAgent: z.string().nullable(),
										ipAddress: z.string().nullable(),
										expiresAt: z.date(),
										createdAt: z.date(),
										updatedAt: z.date(),
									})
									.nullable(),
							}),
						},
					},
				},
			},
		}),
		(c) => {
			const user = c.get("user") as AuthUser;
			const session = c.get("session") as AuthSession;
			return c.json(
				{
					user,
					session,
				},
				HttpStatusCodes.OK,
			);
		},
	);

export default router;
