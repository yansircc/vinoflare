import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { NameVariations } from "./utils";

export function updateApiRoutes(names: NameVariations) {
	const apiPath = join(process.cwd(), "src/server/routes/api.ts");
	let apiContent = readFileSync(apiPath, "utf-8");

	// Add import statement for the module
	const importStatement = `import ${names.camel}Module from "../modules/${names.kebab}/index";`;

	// Find the last module import
	const lastModuleImportMatch = apiContent.match(
		/import \w+Module from "\.\.\/modules\/\w+\/index";/g,
	);
	if (lastModuleImportMatch) {
		const lastImport = lastModuleImportMatch[lastModuleImportMatch.length - 1];
		const lastImportIndex = apiContent.lastIndexOf(lastImport);
		const insertImportAt = apiContent.indexOf("\n", lastImportIndex) + 1;
		apiContent =
			apiContent.slice(0, insertImportAt) +
			importStatement +
			"\n" +
			apiContent.slice(insertImportAt);
	} else {
		// If no module imports found, add after other imports
		const importEndMatch = apiContent.match(
			/import[\s\S]*?(?=\n\n|export|const)/,
		);
		if (importEndMatch) {
			const insertAt = importEndMatch.index! + importEndMatch[0].length;
			apiContent =
				apiContent.slice(0, insertAt) +
				"\n" +
				importStatement +
				apiContent.slice(insertAt);
		}
	}

	// Add module to the modules array
	const modulesArrayMatch = apiContent.match(/const modules = \[([\s\S]*?)\];/);
	if (modulesArrayMatch) {
		const modulesContent = modulesArrayMatch[1];
		const updatedModules = modulesContent.trim() + `, ${names.camel}Module`;
		apiContent = apiContent.replace(
			/const modules = \[([\s\S]*?)\];/,
			`const modules = [${updatedModules}];`,
		);
	}

	writeFileSync(apiPath, apiContent);
	console.log(`\n📝 Updated ${apiPath} to register the new module`);
}
