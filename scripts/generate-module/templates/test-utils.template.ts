import type { NameVariations } from "../utils";

export const getTestUtilsTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import type { D1Database } from "@cloudflare/workers-types";
import type { Insert${pascal} } from "../${kebab}.schema";

/**
 * ${pascal}-specific test utilities
 */

let ${camel}Counter = 0;

export function createTest${pascal}(overrides?: Partial<Insert${pascal}>): Insert${pascal} {
	${camel}Counter++;
	return {
		name: \`Test ${pascal} \${${camel}Counter}\`,
		userId: "test-user-id",
		...overrides,
	} as Insert${pascal};
}

export function reset${pascal}TestData() {
	${camel}Counter = 0;
}

export async function setup${pascal}Table(db: D1Database) {
	await db
		.prepare(\`
			CREATE TABLE IF NOT EXISTS ${kebab} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				user_id TEXT NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (unixepoch()),
				updated_at INTEGER NOT NULL DEFAULT (unixepoch())
			)
		\`)
		.run();
}

export async function clean${pascal}Data(db: D1Database) {
	await db.prepare("DELETE FROM ${kebab}").run();
}`;