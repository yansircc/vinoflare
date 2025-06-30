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
		// TODO: Add your default test data here
		// Example: name: \`Test ${pascal} \${${camel}Counter}\`,
		...overrides,
	} as Insert${pascal};
}

export function reset${pascal}TestData() {
	${camel}Counter = 0;
}

export async function setup${pascal}Table(db: D1Database) {
	// TODO: Update this CREATE TABLE statement to match your schema
	await db
		.prepare(\`
			CREATE TABLE IF NOT EXISTS ${kebab} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				-- Add your columns here
				created_at INTEGER NOT NULL DEFAULT (unixepoch()),
				updated_at INTEGER NOT NULL DEFAULT (unixepoch())
			)
		\`)
		.run();

	// TODO: Add any indexes if needed
	// Example:
	// await db
	//   .prepare(\`
	//     CREATE UNIQUE INDEX IF NOT EXISTS idx_${kebab}_name ON ${kebab}(name)
	//   \`)
	//   .run();
}

export async function clean${pascal}Data(db: D1Database) {
	await db.prepare("DELETE FROM ${kebab}").run();
}`;