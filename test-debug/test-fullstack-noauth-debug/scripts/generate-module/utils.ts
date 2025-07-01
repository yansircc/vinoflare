import { join } from "node:path";

export interface NameVariations {
	kebab: string;
	camel: string;
	pascal: string;
}

export interface Paths {
	base: string;
	handlers: string;
	routes: string;
	testsDir: string;
	test: string;
	testUtils: string;
}

export function getNameVariations(moduleName: string): NameVariations {
	const kebab = moduleName;
	const camel = kebab.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
	const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
	return { kebab, camel, pascal };
}

export function getPaths(kebabCaseName: string): Paths {
	const base = join(process.cwd(), "src/server/modules", kebabCaseName);
	const testsDir = join(base, "__tests__");
	return {
		base,
		handlers: join(base, `${kebabCaseName}.handlers.ts`),
		routes: join(base, `${kebabCaseName}.routes.ts`),
		testsDir,
		test: join(testsDir, `${kebabCaseName}.test.ts`),
		testUtils: join(testsDir, `${kebabCaseName}.test-utils.ts`),
	};
}
