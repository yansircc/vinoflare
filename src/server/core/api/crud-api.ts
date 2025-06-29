import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod/v4";
import { createCRUDRoutes } from "./crud-builder.js";

// Helper to create standard CRUD handlers
export interface CRUDHandlerConfig {
	table: SQLiteTable;
	entityName: string;
	// Optional custom implementations
	beforeCreate?: (data: any, c: Context) => Promise<any> | any;
	afterCreate?: (data: any, c: Context) => Promise<void> | void;
	beforeUpdate?: (id: number, data: any, c: Context) => Promise<any> | any;
	afterUpdate?: (data: any, c: Context) => Promise<void> | void;
	beforeDelete?: (id: number, c: Context) => Promise<void> | void;
	afterDelete?: (id: number, c: Context) => Promise<void> | void;
}

// Create standard CRUD handlers
export function createCRUDHandlers(config: CRUDHandlerConfig) {
	const {
		table,
		entityName,
		beforeCreate,
		afterCreate,
		beforeUpdate,
		afterUpdate,
		beforeDelete,
		afterDelete,
	} = config;

	return {
		// List handler with pagination
		list: async (c: Context) => {
			const db = c.get("db") as DrizzleD1Database;
			const { page = 1, limit = 10 } = c.req.query();

			const pageNum = Number(page);
			const limitNum = Number(limit);
			const offset = (pageNum - 1) * limitNum;

			// Get total count
			const countResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(table);
			const total = countResult[0]?.count || 0;

			// Get paginated results
			const results = await db
				.select()
				.from(table)
				.limit(limitNum)
				.offset(offset);

			return c.json({
				[`${entityName}s`]: results,
				pagination: {
					page: pageNum,
					limit: limitNum,
					total,
					totalPages: Math.ceil(total / limitNum),
				},
			});
		},

		// Get by ID handler
		get: async (c: Context) => {
			const db = c.get("db") as DrizzleD1Database;
			const id = Number(c.req.param("id"));

			const result = await db
				.select()
				.from(table)
				.where(eq((table as any).id, id))
				.limit(1);

			if (!result[0]) {
				throw new HTTPException(404, {
					message: `${entityName} not found`,
				});
			}

			return c.json({ [entityName]: result[0] });
		},

		// Create handler
		create: async (c: Context) => {
			const db = c.get("db") as DrizzleD1Database;
			let data = await c.req.json();

			if (beforeCreate) {
				data = await beforeCreate(data, c);
			}

			const result = await db.insert(table).values(data).returning();

			if (afterCreate) {
				await afterCreate(result[0], c);
			}

			return c.json({ [entityName]: result[0] }, 201);
		},

		// Update handler
		update: async (c: Context) => {
			const db = c.get("db") as DrizzleD1Database;
			const id = Number(c.req.param("id"));
			let data = await c.req.json();

			if (beforeUpdate) {
				data = await beforeUpdate(id, data, c);
			}

			const result = await db
				.update(table)
				.set(data)
				.where(eq((table as any).id, id))
				.returning();

			if (!result[0]) {
				throw new HTTPException(404, {
					message: `${entityName} not found`,
				});
			}

			if (afterUpdate) {
				await afterUpdate(result[0], c);
			}

			return c.json({ [entityName]: result[0] });
		},

		// Delete handler
		delete: async (c: Context) => {
			const db = c.get("db") as DrizzleD1Database;
			const id = Number(c.req.param("id"));

			if (beforeDelete) {
				await beforeDelete(id, c);
			}

			const result = await db
				.delete(table)
				.where(eq((table as any).id, id))
				.returning();

			if (!result[0]) {
				throw new HTTPException(404, {
					message: `${entityName} not found`,
				});
			}

			if (afterDelete) {
				await afterDelete(id, c);
			}

			return c.body(null, 204);
		},
	};
}

// Simplified CRUD API creator
export interface SimpleCRUDConfig<
	TSelect extends z.ZodTypeAny,
	TInsert extends z.ZodTypeAny,
	TUpdate extends z.ZodTypeAny,
> {
	name: string;
	table: SQLiteTable;
	schemas: {
		select: TSelect;
		insert: TInsert;
		update: TUpdate;
	};
	// Optional customizations
	path?: string;
	tags?: string[];
	middleware?: any[];
	handlers?: Partial<Omit<CRUDHandlerConfig, "table" | "entityName">>;
}

// Create a complete CRUD API with minimal configuration
export function createCRUDAPI<
	TSelect extends z.ZodTypeAny,
	TInsert extends z.ZodTypeAny,
	TUpdate extends z.ZodTypeAny,
>(config: SimpleCRUDConfig<TSelect, TInsert, TUpdate>) {
	const {
		name,
		table,
		schemas,
		path,
		tags,
		middleware = [],
		handlers = {},
	} = config;

	// Create standard handlers
	const crudHandlers = createCRUDHandlers({
		table,
		entityName: name,
		...handlers,
	});

	// Create CRUD routes
	return createCRUDRoutes({
		name,
		path,
		schemas,
		tags,
		operations: {
			list: {
				handler: crudHandlers.list,
				middleware,
			},
			get: {
				handler: crudHandlers.get,
				middleware,
			},
			create: {
				handler: crudHandlers.create,
				middleware,
			},
			update: {
				handler: crudHandlers.update,
				middleware,
			},
			delete: {
				handler: crudHandlers.delete,
				middleware,
			},
		},
	});
}
