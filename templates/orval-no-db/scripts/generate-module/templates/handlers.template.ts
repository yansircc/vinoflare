import type { NameVariations } from "../utils";

export const getHandlersTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import type { BaseContext } from "@/server/lib/worker-types";
import type { Insert${pascal}, ${pascal}Id } from "./${kebab}.schema";

// In-memory storage
const ${camel}s = new Map<number, any>();
let nextId = 1;

export const getAll${pascal} = async (c: Context<BaseContext>) => {
	const ${camel}List = Array.from(${camel}s.values()).sort((a, b) => b.id - a.id);

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

	const ${camel}Item = ${camel}s.get(id);

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

	const new${pascal} = {
		id: nextId++,
		...input.body,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	${camel}s.set(new${pascal}.id, new${pascal});

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

	const existing${pascal} = ${camel}s.get(id);
	if (!existing${pascal}) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "${pascal} not found",
		});
	}

	const updated${pascal} = {
		...existing${pascal},
		...input.body,
		updatedAt: new Date(),
	};

	${camel}s.set(id, updated${pascal});

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

	const existing${pascal} = ${camel}s.get(id);
	if (!existing${pascal}) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "${pascal} not found",
		});
	}

	${camel}s.delete(id);

	return c.json({ message: "${pascal} deleted successfully" }, StatusCodes.OK);
};`;