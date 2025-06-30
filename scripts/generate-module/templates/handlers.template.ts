import type { NameVariations } from "../utils";

export const getHandlersTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import { eq } from "drizzle-orm";
import { ${camel} } from "./${kebab}.table";
import type { BaseContext } from "@/server/lib/worker-types";
import type { Insert${pascal}, ${pascal}Id } from "./${kebab}.schema";

export const getAll${pascal} = async (c: Context<BaseContext>) => {
	const db = c.get("db");
	const user = c.get("user");
	
	if (!user) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED, {
			message: "User not authenticated",
		});
	}
	
	// Only return items for the current user
	const ${camel}List = await db.query.${camel}.findMany({
		where: (${camel}, { eq }) => eq(${camel}.userId, user.id),
		orderBy: (${camel}, { desc }) => [desc(${camel}.id)],
	});

	// Always return 200 with array (empty array if no items)
	return c.json({ ${camel}s: ${camel}List }, StatusCodes.OK);
};

export const get${pascal}ById = async (
	c: Context<BaseContext>,
	input: { params?: { id: ${pascal}Id } },
) => {
	const id = input.params?.id;
	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	const db = c.get("db");
	const user = c.get("user");
	
	if (!user) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED, {
			message: "User not authenticated",
		});
	}
	
	const ${camel}Item = await db.query.${camel}.findFirst({
		where: (${camel}, { and, eq }) => 
			and(eq(${camel}.id, id), eq(${camel}.userId, user.id)),
	});

	if (!${camel}Item) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "${pascal} not found",
		});
	}

	return c.json({ ${camel}: ${camel}Item }, StatusCodes.OK);
};

export const create${pascal} = async (
	c: Context<BaseContext>,
	input: { body?: Insert${pascal} },
) => {
	if (!input.body) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	const db = c.get("db");
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED, {
			message: "User not authenticated",
		});
	}

	// Create the ${camel} with current user's ID
	const [new${pascal}] = await db.insert(${camel}).values({
		...input.body,
		userId: user.id, // Always use authenticated user's ID
	}).returning();

	return c.json({ ${camel}: new${pascal} }, StatusCodes.CREATED);
};

export const update${pascal} = async (
	c: Context<BaseContext>,
	input: { params?: { id: ${pascal}Id }; body?: Partial<Insert${pascal}> },
) => {
	const id = input.params?.id;
	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	if (!input.body) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
		});
	}

	const db = c.get("db");
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED, {
			message: "User not authenticated",
		});
	}

	// Check if exists and belongs to user
	const existing = await db.query.${camel}.findFirst({
		where: (${camel}, { and, eq }) => 
			and(eq(${camel}.id, id), eq(${camel}.userId, user.id)),
	});

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "${pascal} not found",
		});
	}

	// Update the ${camel}
	const [updated${pascal}] = await db
		.update(${camel})
		.set(input.body)
		.where(eq(${camel}.id, id))
		.returning();

	return c.json({ ${camel}: updated${pascal} }, StatusCodes.OK);
};

export const delete${pascal} = async (
	c: Context<BaseContext>,
	input: { params?: { id: ${pascal}Id } },
) => {
	const id = input.params?.id;
	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	const db = c.get("db");
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED, {
			message: "User not authenticated",
		});
	}

	// Check if exists and belongs to user
	const existing = await db.query.${camel}.findFirst({
		where: (${camel}, { and, eq }) => 
			and(eq(${camel}.id, id), eq(${camel}.userId, user.id)),
	});

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "${pascal} not found",
		});
	}

	// Delete the ${camel}
	await db.delete(${camel}).where(eq(${camel}.id, id));

	// Return 204 No Content for successful deletion
	return new Response(null, { status: StatusCodes.NO_CONTENT });
};`;