import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	getHandlersTemplate,
	getOpenAPITemplate,
	getRoutesTemplate,
	getTableTemplate,
	getSchemaTemplate,
	getTypesTemplate,
	getIndexTemplate,
	getReadmeTemplate,
	getTestTemplate,
} from "./templates";
import type { NameVariations, Paths } from "./utils";

export function generateModuleFiles(
	paths: Paths,
	names: NameVariations,
) {
	mkdirSync(paths.base, { recursive: true });

	const indexPath = join(paths.base, "index.ts");

	// Core module files - Self-contained architecture
	writeFileSync(indexPath, getIndexTemplate(names));
	writeFileSync(join(paths.base, `${names.kebab}.table.ts`), getTableTemplate(names));
	writeFileSync(join(paths.base, `${names.kebab}.schema.ts`), getSchemaTemplate(names));
	writeFileSync(join(paths.base, `${names.kebab}.types.ts`), getTypesTemplate(names));
	writeFileSync(paths.handlers, getHandlersTemplate(names));
	writeFileSync(paths.openapi, getOpenAPITemplate(names));
	writeFileSync(paths.routes, getRoutesTemplate(names));
	writeFileSync(paths.test, getTestTemplate(names));
	
	// Generate README
	const readmePath = join(paths.base, "README.md");
	writeFileSync(readmePath, getReadmeTemplate(names));

	console.log(`✅ Module "${names.kebab}" scaffolded successfully!`);
	console.log(`📁 Created files:`);
	console.log(`   - ${indexPath}`);
	console.log(`   - ${names.kebab}.table.ts`);
	console.log(`   - ${names.kebab}.schema.ts`);
	console.log(`   - ${names.kebab}.types.ts`);
	console.log(`   - ${paths.handlers}`);
	console.log(`   - ${paths.openapi}`);
	console.log(`   - ${paths.routes}`);
	console.log(`   - ${paths.test}`);
	console.log(`   - ${readmePath} 📚 Module documentation`);

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

