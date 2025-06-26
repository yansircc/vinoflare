import { PUBLIC_API_ROUTES } from "../config/routes";
import type { ModuleDefinition } from "./module-loader";

export interface OpenAPIConfig {
	title: string;
	version: string;
	description?: string;
	contact?: {
		name?: string;
		email?: string;
		url?: string;
	};
	servers?: Array<{
		url: string;
		description?: string;
	}>;
}

const DEFAULT_CONFIG: OpenAPIConfig = {
	title: "Vinoflare API",
	version: "1.0.0",
	description: "REST API for Vinoflare application",
	contact: {
		name: "API Support",
	},
	servers: [
		{
			url: "/api",
			description: "API Server",
		},
	],
};

/**
 * Generate OpenAPI specification from modules
 */
export async function generateOpenAPISpec(
	modules: ModuleDefinition[],
	config: Partial<OpenAPIConfig> = {},
): Promise<Record<string, any>> {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };

	return {
		openapi: "3.0.0",
		info: {
			title: finalConfig.title,
			version: finalConfig.version,
			description: finalConfig.description,
			contact: finalConfig.contact,
		},
		servers: finalConfig.servers,
		paths: collectModulePaths(modules),
		components: {
			schemas: await collectSchemas(),
		},
	};
}

/**
 * Collect OpenAPI paths from all modules
 */
function collectModulePaths(modules: ModuleDefinition[]): Record<string, any> {
	const paths: Record<string, any> = {};

	for (const module of modules) {
		const moduleInstance = module.createModule();
		const moduleSpec = moduleInstance.generateOpenAPISpec({
			title: "",
			version: "",
		});

		// Prefix paths with module basePath
		for (const [path, operations] of Object.entries(moduleSpec.paths || {})) {
			let fullPath = module.basePath + path;
			if (fullPath.endsWith("/") && fullPath.length > 1) {
				fullPath = fullPath.slice(0, -1);
			}

			// Add security requirements based on route type
			const apiPath = `/api${fullPath}`;
			const isPublic = PUBLIC_API_ROUTES.some((pattern: string) => {
				const regex = new RegExp(
					"^" + pattern.replace(/\*/g, ".*").replace(/\//g, "\\/") + "$",
				);
				return regex.test(apiPath);
			});

			// Type guard for operations
			const ops = operations as Record<string, any>;

			// Add security requirements to non-public routes
			if (!isPublic) {
				for (const method of Object.keys(ops)) {
					if (!ops[method].security) {
						ops[method].security = [{ bearerAuth: [] }];
					}
					// Add tag to indicate authentication required
					if (!ops[method].tags) {
						ops[method].tags = [];
					}
					ops[method].tags.push("🔒 Authenticated");
				}
			} else {
				// Add tag to indicate public access
				for (const method of Object.keys(ops)) {
					if (!ops[method].tags) {
						ops[method].tags = [];
					}
					ops[method].tags.push("🌐 Public");
				}
			}

			paths[fullPath] = ops;
		}
	}

	return paths;
}

/**
 * Collect schemas from all modules
 */
async function collectSchemas(): Promise<Record<string, any>> {
	try {
		// Import schemas directly from the generated openapi schemas
		const { openAPISchemas } = await import("../openapi/schemas");
		return openAPISchemas;
	} catch (error) {
		console.warn("Failed to load OpenAPI schemas:", error);
		return {};
	}
}

/**
 * Create OpenAPI endpoint handler
 */
export function createOpenAPIHandler(
	modules: ModuleDefinition[],
	config?: Partial<OpenAPIConfig>,
) {
	return async (c: any) => {
		const spec = await generateOpenAPISpec(modules, config);
		return c.json(spec);
	};
}
