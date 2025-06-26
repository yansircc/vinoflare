import type { Context } from "hono";
import type { z } from "zod/v4";

export interface RouteDefinition<TInput = any> {
	method: "get" | "post" | "put" | "delete" | "patch";
	path: string;

	// Validation schema
	validation?: {
		body?: z.ZodType<TInput>;
	};

	// OpenAPI documentation
	openapi?: {
		tags?: string[];
		summary?: string;
		description?: string;
		deprecated?: boolean;
		security?: Array<Record<string, string[]>>;
		request?: {
			body?: {
				description?: string;
				required?: boolean;
				schema?: any; // Can be OpenAPI schema object or Zod schema
			};
			params?: Array<{
				name: string;
				description?: string;
				required?: boolean;
				schema?: any;
			}>;
			query?: Array<{
				name: string;
				description?: string;
				required?: boolean;
				schema?: any;
			}>;
		};
		responses?: {
			[statusCode: string]: {
				description: string;
				schema?: any; // Can be OpenAPI schema object or Zod schema
				headers?: Record<string, { description?: string; schema?: any }>;
			};
		};
	};

	handler: (c: Context, input?: TInput) => Promise<Response> | Response;
}

export interface APIBuilderOptions {
	middleware?: Array<
		(c: Context, next: () => Promise<void>) => Promise<void | Response>
	>;
	errorHandler?: (error: Error, c: Context) => Response;
}

export interface OpenAPIConfig {
	title: string;
	version: string;
	description?: string;
	servers?: Array<{ url: string; description?: string }>;
	contact?: {
		name?: string;
		email?: string;
		url?: string;
	};
	license?: {
		name: string;
		url?: string;
	};
	externalDocs?: {
		description?: string;
		url: string;
	};
}
