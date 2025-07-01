import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	getHandlersTemplate,
	getRoutesTemplate,
	getSchemaTemplate,
	getIndexTemplate,
	getTestTemplate,
	getTestUtilsTemplate,
} from "./templates";
import type { NameVariations, Paths } from "./utils";

export function generateModuleFiles(
	paths: Paths,
	names: NameVariations,
) {
	mkdirSync(paths.base, { recursive: true });
	mkdirSync(paths.testsDir, { recursive: true });

	const indexPath = join(paths.base, "index.ts");

	// Core module files - Self-contained architecture
	writeFileSync(indexPath, getIndexTemplate(names));
	writeFileSync(join(paths.base, `${names.kebab}.schema.ts`), getSchemaTemplate(names));
	writeFileSync(paths.handlers, getHandlersTemplate(names));
	writeFileSync(paths.routes, getRoutesTemplate(names));
	
	// Test files in __tests__ folder
	writeFileSync(paths.test, getTestTemplate(names));
	writeFileSync(paths.testUtils, getTestUtilsTemplate(names));

	console.log(`✅ Module "${names.kebab}" scaffolded successfully!`);
	console.log(`📁 Created files:`);
	console.log(`   - ${indexPath}`);
	console.log(`   - ${names.kebab}.schema.ts`);
	console.log(`   - ${paths.handlers}`);
	console.log(`   - ${paths.routes}`);
	console.log(`   - __tests__/`);
	console.log(`     - ${names.kebab}.test.ts`);
	console.log(`     - ${names.kebab}.test-utils.ts`);

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

