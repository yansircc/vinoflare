import type { NameVariations } from "../utils";

export const getIndexTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { ModuleDefinition } from "../../core/module-loader";
import { create${pascal}Routes } from "./${kebab}.routes";

// Export all public APIs from this module
export * from "./${kebab}.table";
export * from "./${kebab}.schema";
export * from "./${kebab}.types";
export * from "./${kebab}.handlers";

// Module definition
const ${camel}Module: ModuleDefinition = {
	name: "${kebab}",
	basePath: "/${kebab}s",
	createModule: () => create${pascal}Routes(),
	metadata: {
		version: "1.0.0",
		tags: ["${pascal}"],
		// Add security: ["public"] if you want this module to be publicly accessible
	},
};

export default ${camel}Module;`;