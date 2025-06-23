// API Client code generator

import {
	generateCreateApiClientFunction,
	generateImports,
	generateMockGenerator,
	generateQueryKeyFactory,
	generateResourceTypes,
} from "./templates";
import { OpenAPITypeGenerator } from "./type-generator";
import type {
	OpenAPISchema,
	Operation,
	OperationComplexity,
	ParameterObject,
	RouteInfo,
} from "./types";

export class ApiClientGenerator {
	private routes = new Map<string, Map<string, RouteInfo>>();
	private typeGenerator: OpenAPITypeGenerator;

	constructor(private spec: OpenAPISchema) {
		this.typeGenerator = new OpenAPITypeGenerator(spec);
	}

	get routesMap() {
		return this.routes;
	}

	// Analyze operation complexity to determine best parameter structure
	private analyzeOperationComplexity(
		operation: Operation,
		pathParams: string[],
	): OperationComplexity {
		const queryParams =
			operation.parameters?.filter((p) => p.in === "query") || [];
		const requiredQueryParams = queryParams.filter((p) => p.required);
		const hasRequestBody = !!operation.requestBody;

		return {
			pathParamCount: pathParams.length,
			queryParamCount: queryParams.length,
			requiredQueryParamCount: requiredQueryParams.length,
			hasRequestBody,
			hasOptionalQueryParams: queryParams.length > requiredQueryParams.length,
			// Simple: single path param, no query params, no body (e.g., GET /tasks/{id}, DELETE /tasks/{id})
			isSimple:
				pathParams.length === 1 && queryParams.length === 0 && !hasRequestBody,
			// Medium: single path param + body, no query params (e.g., PUT /tasks/{id})
			isMedium:
				pathParams.length === 1 && queryParams.length === 0 && hasRequestBody,
		};
	}

	// Extract type from OpenAPI operation
	private extractRequestType(operation: Operation): string | null {
		if (!operation.requestBody?.content) return null;

		const content = operation.requestBody.content["application/json"];
		if (!content?.schema) return null;

		return this.typeGenerator.schemaToTypeScript(content.schema);
	}

	private extractResponseType(operation: Operation): string {
		// Check common success status codes
		const successResponse =
			operation.responses["200"] ||
			operation.responses["201"] ||
			operation.responses["204"];

		if (!successResponse?.content) {
			return operation.responses["204"] ? "void" : "unknown";
		}

		const content = successResponse.content["application/json"];
		if (!content?.schema) return "unknown";

		return this.typeGenerator.schemaToTypeScript(content.schema);
	}

	private generateFunctionName(
		method: string,
		path: string,
		hasPathParams: boolean,
		operationId?: string,
	): string {
		if (operationId) {
			// Clean up operationId
			return operationId
				.replace(/^(get|post|put|patch|delete)/, "")
				.replace(/^\w/, (c) => c.toLowerCase());
		}

		// Generate based on method and path
		const resourceMatch = path.match(/\/([^\/]+)(?:\/|$)/);
		const resource = resourceMatch ? resourceMatch[1] : "resource";

		switch (method.toLowerCase()) {
			case "get":
				return hasPathParams ? "getById" : "list";
			case "post":
				return "create";
			case "put":
			case "patch":
				return "update";
			case "delete":
				return "delete";
			default:
				return method.toLowerCase();
		}
	}

	private extractResourceName(path: string): string {
		// Extract resource name from path
		// /api/tasks -> tasks
		// /api/tasks/{id} -> tasks
		// /api -> root
		const match = path.match(/^\/(?:api\/)?([^\/]+)/);
		return match ? match[1] : "root";
	}

	private extractPathParams(path: string): string[] {
		const params: string[] = [];
		const regex = /{([^}]+)}/g;
		let match: RegExpExecArray | null = regex.exec(path);

		while (match !== null) {
			params.push(match[1]);
			match = regex.exec(path);
		}

		return params;
	}

	private extractQueryParams(operation: Operation): ParameterObject[] {
		return operation.parameters?.filter((p) => p.in === "query") || [];
	}

	generateClient(): string {
		// Process all paths
		for (const [path, pathItem] of Object.entries(this.spec.paths)) {
			const resourceName = this.extractResourceName(path);

			if (!this.routes.has(resourceName)) {
				this.routes.set(resourceName, new Map());
			}

			for (const [method, operation] of Object.entries(pathItem)) {
				if (typeof operation !== "object" || !operation) continue;

				const pathParams = this.extractPathParams(path);
				const queryParams = this.extractQueryParams(operation);
				const complexity = this.analyzeOperationComplexity(
					operation,
					pathParams,
				);
				const functionName = this.generateFunctionName(
					method,
					path,
					pathParams.length > 0,
					operation.operationId,
				);

				const routeInfo: RouteInfo = {
					method: method.toUpperCase(),
					path,
					pathParams,
					queryParams,
					requestType: this.extractRequestType(operation),
					responseType: this.extractResponseType(operation),
					functionName,
					description: operation.summary || operation.description,
					complexity,
					requestSchema:
						operation.requestBody?.content?.["application/json"]?.schema,
				};

				this.routes.get(resourceName)!.set(functionName, routeInfo);
			}
		}

		// Generate types
		const types = this.typeGenerator.generateTypes();

		// Generate client code
		return this.generateClientCode(types);
	}

	private generateClientCode(types: Map<string, string>): string {
		const imports = generateImports();

		const typeDefinitions = Array.from(types.entries())
			.map(([name, type]) => `export type ${name} = ${type};`)
			.join("\n\n");

		const resourceTypes = this.routes.has("tasks")
			? generateResourceTypes()
			: "";

		const queryKeyFactories = Array.from(this.routes.keys())
			.map((resourceName) => generateQueryKeyFactory(resourceName))
			.join("\n\n");

		const mockGenerators = this.generateMockGenerators();

		const apiClient = `export const apiClient = {
${Array.from(this.routes.entries())
	.map(([resource, methods]) => this.generateResourceClient(resource, methods))
	.join(",\n")}
};`;

		const createApiClient = generateCreateApiClientFunction();

		return `${imports}

// Type definitions
${typeDefinitions}

// Resource-specific types
${resourceTypes}

// Query key factories
${queryKeyFactories}

// Mock data generators
${mockGenerators}

// API Client
${apiClient}

${createApiClient}
`;
	}

	private generateMockGenerators(): string {
		const generators: string[] = [];

		for (const [resourceName, routes] of this.routes) {
			const resourceType = this.findResourceType(routes);
			if (!resourceType) continue;

			generators.push(generateMockGenerator(resourceName, resourceType));
		}

		return generators.join("\n\n");
	}

	private findResourceType(routes: Map<string, RouteInfo>): string | null {
		// Find the response type of the list or get operation
		for (const [, route] of routes) {
			if (route.method === "GET" && route.responseType) {
				// Extract the inner type from Array<Type>
				const match = route.responseType.match(/^Array<(.+)>$/);
				if (match) return match[1];
				if (route.pathParams.length > 0) return route.responseType;
			}
		}
		return null;
	}

	private generateResourceClient(
		resourceName: string,
		routes: Map<string, RouteInfo>,
	): string {
		const methods = Array.from(routes.entries())
			.map(([, route]) => this.generateMethod(resourceName, route))
			.join(",\n");

		return `  ${resourceName}: {
${methods}
  }`;
	}

	private generateMethod(resourceName: string, route: RouteInfo): string {
		const complexity = route.complexity;

		// For simple operations (single path param, no query, no body)
		if (complexity.isSimple) {
			return this.generateSimpleMethod(resourceName, route);
		}

		// For medium complexity (single path param + body)
		if (complexity.isMedium) {
			return this.generateMediumMethod(resourceName, route);
		}

		// For complex operations
		return this.generateComplexMethod(resourceName, route);
	}

	private generateSimpleMethod(resourceName: string, route: RouteInfo): string {
		const paramName = route.pathParams[0] || "id";
		const pathTemplate = route.path.replace(
			`{${paramName}}`,
			`\${${paramName}}`,
		);

		const comment = route.description
			? `    /**\n     * ${route.description}\n     */\n`
			: "";

		return `${comment}    ${route.functionName}: async (${paramName}: string | number, options?: ApiRequestOptions): Promise<${route.responseType}> => {
      return request<${route.responseType}>(\`${pathTemplate}\`, {
        method: "${route.method}",
        ...options
      });
    }`;
	}

	private generateMediumMethod(resourceName: string, route: RouteInfo): string {
		const paramName = route.pathParams[0] || "id";
		const pathTemplate = route.path.replace(
			`{${paramName}}`,
			`\${${paramName}}`,
		);

		// Extract defaults if available
		const defaults = route.requestSchema
			? this.typeGenerator.extractDefaults(route.requestSchema)
			: {};

		const hasDefaults = Object.keys(defaults).length > 0;
		const dataParam = hasDefaults
			? `applyDefaults(data, ${JSON.stringify(defaults)})`
			: "data";

		const comment = route.description
			? `    /**\n     * ${route.description}\n     */\n`
			: "";

		return `${comment}    ${route.functionName}: async (${paramName}: string | number, data: ${route.requestType}, options?: ApiRequestOptions): Promise<${route.responseType}> => {
      return request<${route.responseType}>(\`${pathTemplate}\`, {
        method: "${route.method}",
        body: JSON.stringify(${dataParam}),
        ...options
      });
    }`;
	}

	private generateComplexMethod(
		resourceName: string,
		route: RouteInfo,
	): string {
		return this.generateStandardMethod(resourceName, route);
	}

	private generateStandardMethod(
		resourceName: string,
		route: RouteInfo,
	): string {
		const params: string[] = [];
		const paramTypes: string[] = [];

		// Path parameters
		if (route.pathParams.length > 0) {
			const pathParamType = `{ ${route.pathParams
				.map((p) => `${p}: string | number`)
				.join("; ")} }`;
			params.push("params");
			paramTypes.push(`params: ${pathParamType}`);
		}

		// Query parameters
		if (route.queryParams.length > 0) {
			const queryParamType = `{ ${route.queryParams
				.map((p) => {
					const required = p.required ? "" : "?";
					const type = this.typeGenerator.schemaToTypeScript(p.schema);
					return `${p.name}${required}: ${type}`;
				})
				.join("; ")} }`;
			params.push("query");
			paramTypes.push(`query?: ${queryParamType}`);
		}

		// Request body
		if (route.requestType) {
			params.push("data");
			paramTypes.push(`data: ${route.requestType}`);
		}

		// Options parameter
		paramTypes.push("options?: ApiRequestOptions");

		// Generate path with parameters
		const pathTemplate = this.generatePathTemplate(
			route.path,
			route.pathParams,
		);

		// Generate query string
		const queryString =
			route.queryParams.length > 0
				? ` + (query ? "?" + new URLSearchParams(Object.entries(query).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : "")`
				: "";

		// Generate fetch options
		const fetchOptions: string[] = [`method: "${route.method}"`];
		if (route.requestType) {
			// Extract defaults if available
			const defaults = route.requestSchema
				? this.typeGenerator.extractDefaults(route.requestSchema)
				: {};

			const hasDefaults = Object.keys(defaults).length > 0;
			const dataParam = hasDefaults
				? `applyDefaults(data, ${JSON.stringify(defaults)})`
				: "data";

			fetchOptions.push(`body: JSON.stringify(${dataParam})`);
		}
		fetchOptions.push("...options");

		const comment = route.description
			? `    /**\n     * ${route.description}\n     */\n`
			: "";

		return `${comment}    ${route.functionName}: async (${paramTypes.join(
			", ",
		)}): Promise<${route.responseType}> => {
      return request<${route.responseType}>(${pathTemplate}${queryString}, {
        ${fetchOptions.join(",\n        ")}
      });
    }`;
	}

	private generatePathTemplate(path: string, pathParams: string[]): string {
		if (pathParams.length === 0) return `"${path}"`;

		let template = path;
		for (const param of pathParams) {
			template = template.replace(`{${param}}`, `\${params.${param}}`);
		}

		return `\`${template}\``;
	}
}
