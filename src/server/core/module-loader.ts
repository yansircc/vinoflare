export interface ModuleMetadata {
	version?: string;
	deprecated?: boolean;
	security?: string[];
	tags?: string[];
}

export interface ModuleDefinition {
	name: string;
	basePath: string;
	createModule: () => any; // Returns an OpenAPIHono instance
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
export function registerModules(
	app: any,
	modules: ModuleDefinition[],
	basePath = "",
) {
	for (const module of modules) {
		const moduleInstance = module.createModule();
		const fullPath = basePath + module.basePath;
		app.route(fullPath, moduleInstance);
	}
}
