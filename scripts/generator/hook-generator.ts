// React Query hooks generator

import {
	generateHookImports,
	generateUsageExamples,
	generateUtilityHooks,
} from "./templates";
import type { OpenAPITypeGenerator } from "./type-generator";
import type { OpenAPISchema, RouteInfo } from "./types";

export class ReactQueryHookGenerator {
	constructor(
		private spec: OpenAPISchema,
		private routes: Map<string, Map<string, RouteInfo>>,
		private typeGenerator: OpenAPITypeGenerator,
	) {}

	generateHooks(): string {
		const hooks: string[] = [];

		// Add usage examples at the top
		hooks.push(generateUsageExamples());

		// Add PatchTask import for backward compatibility
		const hasTasks = this.routes.has("tasks");
		const patchTaskImport = hasTasks
			? '\nimport type { PatchTask } from "./client";'
			: "";

		for (const [resourceName, routeMap] of this.routes) {
			// Skip health, me, and root endpoints - we'll handle them specially
			if (["health", "me", "root"].includes(resourceName)) {
				continue;
			}

			for (const [, route] of routeMap) {
				const hook = this.generateHook(resourceName, route);
				if (hook) {
					hooks.push(hook);
				}
			}
		}

		// Add API endpoint hooks for root endpoints
		for (const [resourceName, routeMap] of this.routes) {
			if (resourceName === "root") {
				for (const [, route] of routeMap) {
					if (route.path === "/api") {
						const hook = this.generateApiHook(route);
						if (hook) {
							hooks.push(hook);
						}
					}
				}
			}
		}

		// Add utility hooks
		hooks.push(generateUtilityHooks());

		return `${generateHookImports()}${patchTaskImport}

${hooks.join("\n\n")}
`;
	}

	private generateApiHook(route: RouteInfo): string | null {
		return `/**
 * ${route.description || "API"}
 */
export const useApi = (
  options?: Omit<
    UseQueryOptions<${route.responseType}, ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["api"],
    queryFn: () => apiClient.api.list(),
    ...options,
  });
};`;
	}

	private generateHook(resourceName: string, route: RouteInfo): string | null {
		const method = route.method.toLowerCase();

		if (method === "get") {
			return this.generateQueryHook(resourceName, route);
		}

		if (["post", "put", "patch", "delete"].includes(method)) {
			return this.generateMutationHook(resourceName, route);
		}

		return null;
	}

	private generateHookName(resourceName: string, route: RouteInfo): string {
		const method = route.method.toLowerCase();
		const singular = resourceName.endsWith("s")
			? resourceName.slice(0, -1)
			: resourceName;
		const capitalizedSingular =
			singular.charAt(0).toUpperCase() + singular.slice(1);
		const capitalizedPlural =
			resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

		switch (method) {
			case "get":
				return route.pathParams.length > 0
					? `use${capitalizedSingular}`
					: `use${capitalizedPlural}`;
			case "post":
				return `useCreate${capitalizedSingular}`;
			case "put":
			case "patch":
				return `useUpdate${capitalizedSingular}`;
			case "delete":
				return `useDelete${capitalizedSingular}`;
			default:
				return `use${capitalizedSingular}${method.charAt(0).toUpperCase() + method.slice(1)}`;
		}
	}

	private generateQueryHook(resourceName: string, route: RouteInfo): string {
		const hookName = this.generateHookName(resourceName, route);
		const responseType = route.responseType;

		// Use simplified parameters for simple operations
		if (route.complexity.isSimple) {
			const paramName = route.pathParams[0] || "id";

			return `/**
 * ${route.description || `Fetch ${resourceName} by ID`}
 */
export const ${hookName} = (
  ${paramName}: string | number,
  options?: Omit<
    UseQueryOptions<${responseType}, ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["${resourceName}", ${paramName}],
    queryFn: () => apiClient.${resourceName}.${route.functionName}(${paramName}),
    ...options,
  });
};`;
		}

		// Standard implementation for complex operations
		if (route.pathParams.length > 0) {
			const paramType = `{ ${route.pathParams
				.map((p) => `${p}: string | number`)
				.join("; ")} }`;

			return `/**
 * ${route.description || `Fetch ${resourceName} by ID`}
 */
export const ${hookName} = (
  params: ${paramType},
  options?: Omit<
    UseQueryOptions<${responseType}, ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["${resourceName}", params],
    queryFn: () => apiClient.${resourceName}.${route.functionName}(params),
    ...options,
  });
};`;
		} else {
			// List query hook
			const queryParamType =
				route.queryParams.length > 0
					? `{ ${route.queryParams
							.map((p) => {
								const required = p.required ? "" : "?";
								const type = this.typeGenerator.schemaToTypeScript(p.schema);
								return `${p.name}${required}: ${type}`;
							})
							.join("; ")} }`
					: null;

			const params = queryParamType ? `query?: ${queryParamType}, ` : "";

			return `/**
 * ${route.description || `Fetch all ${resourceName}`}
 */
export const ${hookName} = (
  ${params}options?: Omit<
    UseQueryOptions<${responseType}, ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ${queryParamType ? `["${resourceName}", query]` : `["${resourceName}"]`},
    queryFn: () => apiClient.${resourceName}.${route.functionName}(${queryParamType ? "query" : ""}),
    ...options,
  });
};`;
		}
	}

	private generateMutationHook(resourceName: string, route: RouteInfo): string {
		const hookName = this.generateHookName(resourceName, route);
		const responseType = route.responseType;
		const method = route.method.toLowerCase();

		// Simple operations (just ID parameter)
		if (route.complexity.isSimple) {
			const paramName = route.pathParams[0] || "id";

			return `/**
 * ${route.description || `${method} ${resourceName}`}
 */
export const ${hookName} = (
  options?: Omit<UseMutationOptions<${responseType}, ApiError, string | number>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (${paramName}) => apiClient.${resourceName}.${route.functionName}(${paramName}),
    onSuccess: (data, ${paramName}, context) => {
      queryClient.invalidateQueries({ queryKey: ["${resourceName}"] });
      queryClient.invalidateQueries({ queryKey: ["${resourceName}", ${paramName}] });
      options?.onSuccess?.(data, ${paramName}, context);
    },
    ...options,
  });
};`;
		}

		// Medium complexity (ID + data)
		if (route.complexity.isMedium) {
			const paramName = route.pathParams[0] || "id";
			const inputType = route.requestType || "any";

			// For backward compatibility with tasks
			const dataType =
				resourceName === "tasks" && method === "patch"
					? "PatchTask"
					: inputType;

			return `/**
 * ${route.description || `${method} ${resourceName}`}
 */
export const ${hookName} = (
  options?: Omit<
    UseMutationOptions<${responseType}, ApiError, { ${paramName}: string | number; data: ${dataType} }>,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ${paramName}, data }) => apiClient.${resourceName}.${route.functionName}(${paramName}, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["${resourceName}"] });
      queryClient.invalidateQueries({ queryKey: ["${resourceName}", variables.${paramName}] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};`;
		}

		// For POST without path params (create operations)
		if (
			method === "post" &&
			route.pathParams.length === 0 &&
			route.requestType
		) {
			return `/**
 * ${route.description || `POST ${resourceName}`}
 */
export const ${hookName} = (
  options?: Omit<
    UseMutationOptions<${responseType}, ApiError, { data: ${route.requestType} }>,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }) => apiClient.${resourceName}.${route.functionName}(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["${resourceName}"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};`;
		}

		// Complex operations - use standard format
		return this.generateStandardMutationHook(resourceName, route);
	}

	private generateStandardMutationHook(
		resourceName: string,
		route: RouteInfo,
	): string {
		const hookName = this.generateHookName(resourceName, route);
		const responseType = route.responseType;

		// Build mutation variable type
		const variablesParts: string[] = [];

		if (route.pathParams.length > 0) {
			variablesParts.push(
				`params: { ${route.pathParams
					.map((p) => `${p}: string | number`)
					.join("; ")} }`,
			);
		}

		if (route.requestType) {
			variablesParts.push(`data: ${route.requestType}`);
		}

		const variablesType =
			variablesParts.length > 0 ? `{ ${variablesParts.join("; ")} }` : "void";

		// Build mutation function call
		const callParams: string[] = [];
		if (route.pathParams.length > 0) callParams.push("params");
		if (route.requestType) callParams.push("data");

		const mutationFn =
			callParams.length > 0
				? `({ ${callParams.join(", ")} }) => apiClient.${resourceName}.${route.functionName}(${callParams.join(", ")})`
				: `() => apiClient.${resourceName}.${route.functionName}()`;

		// Invalidation logic
		const invalidations: string[] = [
			`queryClient.invalidateQueries({ queryKey: ["${resourceName}"] });`,
		];

		if (route.pathParams.length > 0) {
			invalidations.push(
				`queryClient.invalidateQueries({ queryKey: ["${resourceName}", ${
					route.pathParams.length === 1
						? `variables.params.${route.pathParams[0]}`
						: "variables.params"
				}] });`,
			);
		}

		return `/**
 * ${route.description || `${route.method} ${resourceName}`}
 */
export const ${hookName} = (
  options?: Omit<
    UseMutationOptions<${responseType}, ApiError, ${variablesType}>,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ${mutationFn},
    onSuccess: (data, variables, context) => {
      ${invalidations.join("\n      ")}
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};`;
	}
}
