import type { NameVariations } from "../utils";

export const getHandlersTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import type { BaseContext } from "@/server/lib/worker-types";
import type { Insert${pascal}, ${pascal}Id, ${pascal} } from "./${kebab}.schema";

// In-memory storage (replace with your preferred storage solution)
const ${camel}Store = new Map<${pascal}Id, ${pascal}>();
let nextId = 1;

export const getAll${pascal} = async (c: Context<BaseContext>) => {
	// Return all items from in-memory store
	const ${camel}List = Array.from(${camel}Store.values());
	
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
	
	const ${camel}Item = ${camel}Store.get(id);

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

	// Create the ${camel}
	const new${pascal}: ${pascal} = {
		id: nextId++,
		...input.body,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	
	${camel}Store.set(new${pascal}.id, new${pascal});

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

	// Check if exists
	const existing = ${camel}Store.get(id);

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "${pascal} not found",
		});
	}

	// Update the ${camel}
	const updated${pascal}: ${pascal} = {
		...existing,
		...input.body,
		id: existing.id, // Preserve ID
		createdAt: existing.createdAt, // Preserve creation date
		updatedAt: new Date(),
	};
	
	${camel}Store.set(id, updated${pascal});

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

	// Check if exists
	const existing = ${camel}Store.get(id);

	if (!existing) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "${pascal} not found",
		});
	}

	// Delete the ${camel}
	${camel}Store.delete(id);

	return c.json({ success: true }, StatusCodes.OK);
};`;