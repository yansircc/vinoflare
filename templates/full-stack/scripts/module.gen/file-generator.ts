import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getSchemaTemplate } from "./schema-template";
import {
	getHandlersTemplate,
	getOpenAPITemplate,
	getRoutesTemplate,
	getTestTemplate,
} from "./templates";
import type { NameVariations, Paths } from "./utils";

export function generateModuleFiles(
	paths: Paths,
	names: NameVariations,
	schemaName: string,
) {
	mkdirSync(paths.base, { recursive: true });

	const indexPath = join(paths.base, "index.ts");

	writeFileSync(indexPath, getIndexTemplate(names));
	writeFileSync(
		paths.handlers,
		getHandlersTemplate({ ...names, schema: schemaName }),
	);
	writeFileSync(paths.openapi, getOpenAPITemplate(names));
	writeFileSync(paths.routes, getRoutesTemplate(names));
	writeFileSync(paths.test, getTestTemplate(names));

	// Generate schema template file
	const schemaPath = join(paths.base, `${names.kebab}.schema.example.ts`);
	writeFileSync(schemaPath, getSchemaTemplate(names));

	console.log(`✅ Module "${names.kebab}" scaffolded successfully!`);
	console.log(`📁 Created files:`);
	console.log(`   - ${indexPath}`);
	console.log(`   - ${paths.handlers}`);
	console.log(`   - ${paths.openapi}`);
	console.log(`   - ${paths.routes}`);
	console.log(`   - ${paths.test}`);
	console.log(`   - ${schemaPath} (example schema)`);

	console.log(`\n📋 CRUD Operations Generated:`);
	console.log(`   - GET    /api/${names.kebab}      - Get all ${names.camel}`);
	console.log(
		`   - GET    /api/${names.kebab}/:id  - Get ${names.camel} by ID`,
	);
	console.log(
		`   - POST   /api/${names.kebab}      - Create new ${names.camel}`,
	);
	console.log(`   - PUT    /api/${names.kebab}/:id  - Update ${names.camel}`);
	console.log(`   - DELETE /api/${names.kebab}/:id  - Delete ${names.camel}`);
}

function getIndexTemplate(names: NameVariations): string {
	return `import type { ModuleDefinition } from "../../core/module-loader";
import { create${names.pascal}Module } from "./${names.kebab}.routes";

const ${names.camel}Module: ModuleDefinition = {
	name: "${names.kebab}",
	basePath: "/${names.kebab}",
	createModule: create${names.pascal}Module,
	metadata: {
		version: "1.0.0",
		tags: ["${names.pascal}"],
		security: ["public"],
	},
};

export default ${names.camel}Module;`;
}
