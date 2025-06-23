// OpenAPI and generator type definitions

export interface OpenAPISchema {
	openapi: string;
	info: {
		version: string;
		title: string;
		description?: string;
	};
	paths: Record<string, PathItem>;
	components?: {
		schemas?: Record<string, SchemaObject>;
		parameters?: Record<string, ParameterObject>;
	};
}

export interface PathItem {
	[method: string]: Operation;
}

export interface Operation {
	tags?: string[];
	summary?: string;
	description?: string;
	operationId?: string;
	parameters?: ParameterObject[];
	requestBody?: RequestBody;
	responses: Record<string, Response>;
}

export interface ParameterObject {
	name: string;
	in: "path" | "query" | "header" | "cookie";
	required?: boolean;
	schema: SchemaObject;
	description?: string;
}

export interface RequestBody {
	required?: boolean;
	content?: {
		[mediaType: string]: {
			schema: SchemaObject;
		};
	};
}

export interface Response {
	description: string;
	content?: {
		[mediaType: string]: {
			schema: SchemaObject;
		};
	};
}

export interface SchemaObject {
	type?: string;
	format?: string;
	properties?: Record<string, SchemaObject>;
	items?: SchemaObject;
	required?: string[];
	enum?: any[];
	default?: any;
	nullable?: boolean;
	allOf?: SchemaObject[];
	oneOf?: SchemaObject[];
	anyOf?: SchemaObject[];
	$ref?: string;
	additionalProperties?: boolean | SchemaObject;
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
}

export interface RouteInfo {
	method: string;
	path: string;
	pathParams: string[];
	queryParams: ParameterObject[];
	requestType: string | null;
	responseType: string;
	functionName: string;
	description?: string;
	complexity: OperationComplexity;
	requestSchema?: SchemaObject;
}

export interface OperationComplexity {
	pathParamCount: number;
	queryParamCount: number;
	requiredQueryParamCount: number;
	hasRequestBody: boolean;
	hasOptionalQueryParams: boolean;
	isSimple: boolean;
	isMedium: boolean;
}
