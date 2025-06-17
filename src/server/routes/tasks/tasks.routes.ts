import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema, createErrorSchema } from "stoker/openapi/schemas";

import {
	insertTaskSchema,
	patchTaskSchema,
	selectTaskSchema,
} from "@/server/db/schema";
import { notFoundSchema } from "@/server/lib/constants";

const tags = ["Tasks"];

export const list = createRoute({
	path: "/tasks",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectTaskSchema),
			"The list of tasks",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createErrorSchema(z.object({ message: z.string() })),
			"Unauthorized",
		),
	},
});

export const create = createRoute({
	path: "/tasks",
	method: "post",
	request: {
		body: jsonContentRequired(insertTaskSchema, "The task to create"),
	},
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectTaskSchema, "The created task"),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createErrorSchema(z.object({ message: z.string() })),
			"Unauthorized",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(insertTaskSchema),
			"The validation error(s)",
		),
	},
});

export const getOne = createRoute({
	path: "/tasks/{id}",
	method: "get",
	request: {
		params: IdParamsSchema,
	},
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectTaskSchema, "The requested task"),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createErrorSchema(z.object({ message: z.string() })),
			"Unauthorized",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdParamsSchema),
			"Invalid id error",
		),
	},
});

export const patch = createRoute({
	path: "/tasks/{id}",
	method: "patch",
	request: {
		params: IdParamsSchema,
		body: jsonContentRequired(patchTaskSchema, "The task updates"),
	},
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectTaskSchema, "The updated task"),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createErrorSchema(z.object({ message: z.string() })),
			"Unauthorized",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(patchTaskSchema).or(createErrorSchema(IdParamsSchema)),
			"The validation error(s)",
		),
	},
});

export const remove = createRoute({
	path: "/tasks/{id}",
	method: "delete",
	request: {
		params: IdParamsSchema,
	},
	tags,
	responses: {
		[HttpStatusCodes.NO_CONTENT]: {
			description: "Task deleted",
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createErrorSchema(z.object({ message: z.string() })),
			"Unauthorized",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdParamsSchema),
			"Invalid id error",
		),
	},
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
