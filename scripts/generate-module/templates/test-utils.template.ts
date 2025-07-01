import type { NameVariations } from "../utils";

export const getTestUtilsTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { Insert${pascal} } from "../${kebab}.schema";

/**
 * ${pascal}-specific test utilities
 */

let ${camel}Counter = 0;

export function createTest${pascal}(overrides?: Partial<Insert${pascal}>): Insert${pascal} {
	${camel}Counter++;
	return {
		name: \`Test ${pascal} \${${camel}Counter}\`,
		...overrides,
	} as Insert${pascal};
}

export function reset${pascal}TestData() {
	${camel}Counter = 0;
}`;