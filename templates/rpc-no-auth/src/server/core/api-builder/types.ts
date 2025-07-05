import type { Context } from "hono";
import type { z } from "zod/v4";

export type HTTPMethod = "get" | "post" | "put" | "delete" | "patch";

export type InputType = "body" | "params" | "query";

export interface ValidationSchemas {
	body?: z.ZodType<any>;
	params?: z.ZodType<any>;
	query?: z.ZodType<any>;
}

export interface ResponseDefinition {
	statusCode: number;
	description: string;
	schema?: z.ZodType<any>;
}

export interface RouteDefinition<TBody = any, TParams = any, TQuery = any> {
	method: HTTPMethod;
	path: string;
	validation?: ValidationSchemas;
	openapi?: OpenAPIRouteConfig;
	handler: RouteHandler<TBody, TParams, TQuery>;
	responses?: ResponseDefinition[];
}

// HandlerResult type for unified handlers
export interface HandlerResult<T = any> {
	data: T;
	status?: number;
}

export type RouteHandler<TBody = any, TParams = any, TQuery = any> = (
	c: Context,
	input: {
		body?: TBody;
		params?: TParams;
		query?: TQuery;
	},
) => Promise<Response | HandlerResult> | Response | HandlerResult;

export interface OpenAPIRouteConfig {
	tags?: string[];
	summary?: string;
	description?: string;
	deprecated?: boolean;
	security?: Array<Record<string, string[]>>;
	request?: {
		body?: {
			description?: string;
			required?: boolean;
			schema?: any;
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
			schema?: any;
			headers?: Record<string, { description?: string; schema?: any }>;
		};
	};
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
