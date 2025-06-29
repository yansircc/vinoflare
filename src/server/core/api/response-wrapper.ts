import { z } from "zod/v4";

// Utility to pluralize entity names (simple version)
function pluralize(word: string): string {
	// Simple pluralization rules
	if (
		word.endsWith("y") &&
		!["a", "e", "i", "o", "u"].includes(word[word.length - 2])
	) {
		return word.slice(0, -1) + "ies";
	}
	if (
		word.endsWith("s") ||
		word.endsWith("x") ||
		word.endsWith("ch") ||
		word.endsWith("sh")
	) {
		return word + "es";
	}
	return word + "s";
}

// Response wrapper types
export type SingleResponse<TEntity extends string, TData> = {
	[K in TEntity]: TData;
};

export type ArrayResponse<TEntity extends string, TData> = {
	[K in TEntity as `${K}s`]: TData[];
};

// Create response schema with proper wrapping
export function wrapResponse<TSchema extends z.ZodTypeAny>(
	entityName: string,
	schema: TSchema,
	isArray = false,
): z.ZodObject<any> {
	if (isArray) {
		return z.object({
			[pluralize(entityName)]: z.array(schema),
		});
	}
	return z.object({
		[entityName]: schema,
	});
}

// Auto-detect if schema is array and wrap accordingly
export function autoWrapResponse<TSchema extends z.ZodTypeAny>(
	entityName: string,
	schema: TSchema,
): z.ZodObject<any> {
	if (schema instanceof z.ZodArray) {
		return z.object({
			[pluralize(entityName)]: schema,
		});
	}
	return z.object({
		[entityName]: schema,
	});
}

// Helper to create wrapped responses for API builder
export function response<TSchema extends z.ZodTypeAny>(
	entityName: string,
	schema: TSchema,
) {
	return autoWrapResponse(entityName, schema);
}

// Pagination wrapper
export function paginatedResponse<TSchema extends z.ZodTypeAny>(
	entityName: string,
	schema: TSchema,
) {
	return z.object({
		[pluralize(entityName)]: z.array(schema),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
		}),
	});
}

// Success response wrapper for handlers
export function successResponse<T>(data: T, entityName?: string) {
	if (!entityName) {
		return data;
	}

	if (Array.isArray(data)) {
		return {
			[pluralize(entityName)]: data,
		};
	}

	return {
		[entityName]: data,
	};
}
