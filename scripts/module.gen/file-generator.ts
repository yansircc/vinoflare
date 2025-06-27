import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	getHandlersTemplate,
	getOpenAPITemplate,
	getRoutesTemplate,
	getIndexTemplate,
	getChecklistTemplate,
} from "./templates";
import type { NameVariations, Paths } from "./utils";

export function generateModuleFiles(
	paths: Paths,
	names: NameVariations,
) {
	mkdirSync(paths.base, { recursive: true });

	const indexPath = join(paths.base, "index.ts");

	// Core module files
	writeFileSync(indexPath, getIndexTemplate(names));
	writeFileSync(paths.handlers, getHandlersTemplate(names));
	writeFileSync(paths.openapi, getOpenAPITemplate(names));
	writeFileSync(paths.routes, getRoutesTemplate(names));
	
	// Generate checklist
	const checklistPath = join(paths.base, "CHECKLIST.md");
	writeFileSync(checklistPath, getChecklistTemplate(names));

	console.log(`✅ Module "${names.kebab}" scaffolded successfully!`);
	console.log(`📁 Created files:`);
	console.log(`   - ${indexPath}`);
	console.log(`   - ${paths.handlers}`);
	console.log(`   - ${paths.openapi}`);
	console.log(`   - ${paths.routes}`);
	console.log(`   - ${checklistPath} 📋 Integration checklist`);

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

