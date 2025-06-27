import { join } from "node:path";

export interface NameVariations {
	kebab: string;
	camel: string;
	pascal: string;
}

export interface Paths {
	base: string;
	handlers: string;
	openapi: string;
	routes: string;
	test: string;
}

export function getNameVariations(moduleName: string): NameVariations {
	const kebab = moduleName;
	const camel = kebab.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
	const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
	return { kebab, camel, pascal };
}

export function getPaths(kebabCaseName: string): Paths {
	const base = join(process.cwd(), "src/server/modules", kebabCaseName);
	return {
		base,
		handlers: join(base, `${kebabCaseName}.handlers.ts`),
		openapi: join(base, `${kebabCaseName}.openapi.ts`),
		routes: join(base, `${kebabCaseName}.routes.ts`),
		test: join(base, `${kebabCaseName}.test.ts`),
	};
}
