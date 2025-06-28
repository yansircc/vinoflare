export interface ModuleMetadata {
	version?: string;
	deprecated?: boolean;
	security?: string[];
	tags?: string[];
}

export interface ModuleDefinition {
	name: string;
	basePath: string;
	createModule: () => any; // Returns an APIBuilder instance
	metadata?: ModuleMetadata;
}

/**
 * Automatically discover and load all modules
 */
export async function loadModules(): Promise<ModuleDefinition[]> {
	const moduleFiles = import.meta.glob<{ default: ModuleDefinition }>(
		"../modules/*/index.ts",
		{ eager: true },
	);

	const modules: ModuleDefinition[] = [];

	for (const [path, module] of Object.entries(moduleFiles)) {
		if (module.default) {
			modules.push(module.default);
		} else {
			console.warn(
				`Module at ${path} does not export a default ModuleDefinition`,
			);
		}
	}

	return modules.sort((a, b) => a.basePath.localeCompare(b.basePath));
}

/**
 * Register all modules with the app
 */
export function registerModules(app: any, modules: ModuleDefinition[], basePath = '') {
	for (const module of modules) {
		const moduleInstance = module.createModule();
		const fullPath = basePath + module.basePath;
		app.route(fullPath, moduleInstance.getApp());
	}
}

/**
 * Collect OpenAPI paths from all modules
 */
export function collectModulePaths(
	modules: ModuleDefinition[],
): Record<string, any> {
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
			paths[fullPath] = operations;
		}
	}

	return paths;
}
