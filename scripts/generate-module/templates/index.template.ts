import type { NameVariations } from "../utils";

export const getIndexTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { ModuleDefinition } from "../../core/module-loader";
import { create${pascal}Module } from "./${kebab}.routes";

// Export public APIs
export * from "./${kebab}.schema";

// Module definition
const ${camel}Module: ModuleDefinition = {
	name: "${kebab}",
	basePath: "/${kebab}",
	createModule: create${pascal}Module,
	metadata: {
		version: "1.0.0",
		tags: ["${pascal}"],
	},
};

export default ${camel}Module;`;