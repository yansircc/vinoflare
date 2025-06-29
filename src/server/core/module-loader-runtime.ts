import type { ModuleDefinition } from "./module-loader";

/**
 * Manually import all modules for runtime
 * This is used when import.meta.glob is not available (e.g., in Bun scripts)
 */
export async function loadModulesRuntime(): Promise<ModuleDefinition[]> {
	const modules: ModuleDefinition[] = [];

	// Manually import each module
	// Add new modules here when created
	try {
		const helloModule = await import("../modules/hello/index");
		if (helloModule.default) {
			modules.push(helloModule.default);
		}
	} catch (error) {
		console.warn("Failed to load hello module:", error);
	}

	// Add more modules here as they are created
	// try {
	//   const postsModule = await import("../modules/posts/index");
	//   if (postsModule.default) {
	//     modules.push(postsModule.default);
	//   }
	// } catch (error) {
	//   console.warn("Failed to load posts module:", error);
	// }

	return modules.sort((a, b) => a.basePath.localeCompare(b.basePath));
}
