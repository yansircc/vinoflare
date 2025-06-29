import type { RouteHandler } from "@hono/zod-openapi";
import { z } from "zod/v4";
import { APIBuilder } from "./builder.js";
import { paginatedResponse, response } from "./response-wrapper.js";

// CRUD configuration interface
export interface CRUDConfig<
	TSelect extends z.ZodTypeAny = z.ZodTypeAny,
	TInsert extends z.ZodTypeAny = z.ZodTypeAny,
	TUpdate extends z.ZodTypeAny = z.ZodTypeAny,
> {
	// Entity name (singular)
	name: string;

	// Path prefix (defaults to plural of name)
	path?: string;

	// Schemas
	schemas: {
		select: TSelect;
		insert: TInsert;
		update: TUpdate;
		// Optional schemas
		params?: z.ZodObject<{ id: z.ZodType<any> }>;
		query?: z.ZodObject<any>;
	};

	// Tags for OpenAPI documentation
	tags?: string[];

	// Override specific operations
	operations?: {
		list?: {
			enabled?: boolean;
			paginated?: boolean;
			handler?: RouteHandler<any, any>;
			middleware?: any[];
			query?: z.ZodObject<any>;
		};
		get?: {
			enabled?: boolean;
			handler?: RouteHandler<any, any>;
			middleware?: any[];
		};
		create?: {
			enabled?: boolean;
			handler?: RouteHandler<any, any>;
			middleware?: any[];
		};
		update?: {
			enabled?: boolean;
			handler?: RouteHandler<any, any>;
			middleware?: any[];
			method?: "put" | "patch";
		};
		delete?: {
			enabled?: boolean;
			handler?: RouteHandler<any, any>;
			middleware?: any[];
		};
	};
}

// Default param schema
const defaultParamSchema = z.object({
	id: z.coerce.number().positive(),
});

// Default query schema for pagination
const defaultPaginationSchema = z.object({
	page: z.coerce.number().positive().default(1),
	limit: z.coerce.number().positive().max(100).default(10),
});

// CRUD builder function
export function createCRUDRoutes<
	TSelect extends z.ZodTypeAny,
	TInsert extends z.ZodTypeAny,
	TUpdate extends z.ZodTypeAny,
>(config: CRUDConfig<TSelect, TInsert, TUpdate>): APIBuilder {
	const {
		name,
		path = `/${name}s`, // Default to plural
		schemas,
		tags = [name],
		operations = {},
	} = config;

	const api = new APIBuilder(path);
	api.tags(...tags);

	const paramSchema = schemas.params || defaultParamSchema;

	// List operation
	if (operations.list?.enabled !== false && operations.list?.handler) {
		const isPaginated = operations.list.paginated !== false;
		const querySchema =
			operations.list.query ||
			(isPaginated ? defaultPaginationSchema : undefined);

		api.get("/", {
			summary: `Get all ${name}s`,
			description: `Retrieve a list of all ${name}s`,
			query: querySchema,
			response: isPaginated
				? paginatedResponse(name, schemas.select)
				: response(name, z.array(schemas.select)),
			middleware: operations.list.middleware,
			handler: operations.list.handler,
		});
	}

	// Get by ID operation
	if (operations.get?.enabled !== false && operations.get?.handler) {
		api.get("/:id", {
			summary: `Get ${name} by ID`,
			description: `Retrieve a single ${name} by its ID`,
			params: paramSchema,
			response: response(name, schemas.select),
			middleware: operations.get.middleware,
			handler: operations.get.handler,
		});
	}

	// Create operation
	if (operations.create?.enabled !== false && operations.create?.handler) {
		api.post("/", {
			summary: `Create ${name}`,
			description: `Create a new ${name}`,
			body: schemas.insert,
			response: response(name, schemas.select),
			status: 201,
			middleware: operations.create.middleware,
			handler: operations.create.handler,
		});
	}

	// Update operation
	if (operations.update?.enabled !== false && operations.update?.handler) {
		const method = operations.update.method || "put";
		const updateApi = method === "put" ? api.put : api.patch;

		updateApi.call(api, "/:id", {
			summary: `Update ${name}`,
			description: `Update an existing ${name}`,
			params: paramSchema,
			body: schemas.update,
			response: response(name, schemas.select),
			middleware: operations.update.middleware,
			handler: operations.update.handler,
		});
	}

	// Delete operation
	if (operations.delete?.enabled !== false && operations.delete?.handler) {
		api.delete("/:id", {
			summary: `Delete ${name}`,
			description: `Delete a ${name} by its ID`,
			params: paramSchema,
			response: undefined, // 204 No Content
			status: 204,
			middleware: operations.delete.middleware,
			handler: operations.delete.handler,
		});
	}

	return api;
}

// Helper type to infer handler types from schemas
export type CRUDHandlers = {
	list: RouteHandler<any, any>;
	get: RouteHandler<any, any>;
	create: RouteHandler<any, any>;
	update: RouteHandler<any, any>;
	delete: RouteHandler<any, any>;
};
