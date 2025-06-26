import { exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, "../../dist/index.js");
const TEST_DIR = path.join(__dirname, "../../test-output");

// Test configurations
const testConfigs = [
	{
		name: "api-only-no-features",
		args: "--type=api-only --no-db --no-git -y",
		expectedFiles: ["package.json", "src/index.ts", "src/server/routes/api.ts"],
		unexpectedFiles: [
			"src/server/db",
			"src/server/modules/auth",
			"src/server/modules/posts",
			"src/utils/manifest.ts",
		],
		typecheck: true,
	},
	{
		name: "api-only-db-auth",
		args: "--type=api-only --no-git -y",
		expectedFiles: [
			"package.json",
			"src/server/db/index.ts",
			"src/server/modules/auth/index.ts",
			"src/server/modules/posts/index.ts",
			".dev.vars",
		],
		unexpectedFiles: ["src/utils/manifest.ts"],
		typecheck: true,
		requiresEnvSetup: true,
	},
	{
		name: "api-only-db-noauth",
		args: "--type=api-only --no-auth --no-git -y",
		expectedFiles: [
			"package.json",
			"src/server/db/index.ts",
			"src/server/modules/posts/index.ts",
		],
		unexpectedFiles: [
			"src/server/modules/auth",
			"src/server/lib/auth.ts",
			"src/utils/manifest.ts",
		],
		typecheck: true,
		requiresEnvSetup: true,
	},
	{
		name: "fullstack-all-features",
		args: "--type=full-stack --no-git -y",
		expectedFiles: [
			"package.json",
			"src/client/app.tsx",
			"src/server/db/index.ts",
			"src/server/modules/auth/index.ts",
			"src/utils/manifest.ts",
		],
		typecheck: true,
		requiresEnvSetup: true,
	},
];

describe("CLI Integration Tests", () => {
	beforeEach(async () => {
		// Ensure test directory is clean
		await fs.ensureDir(TEST_DIR);
	});

	afterEach(async () => {
		// Clean up test directory
		await fs.remove(TEST_DIR);
	});

	testConfigs.forEach((config) => {
		describe(config.name, () => {
			const projectPath = path.join(TEST_DIR, config.name);

			it("should create project with correct structure", async () => {
				// Run CLI
				const { stdout, stderr } = await execAsync(
					`node ${CLI_PATH} ${config.name} ${config.args}`,
					{ cwd: TEST_DIR },
				);

				expect(stderr).toBe("");
				expect(stdout).toContain("Project created");

				// Check expected files exist
				for (const file of config.expectedFiles) {
					const filePath = path.join(projectPath, file);
					const exists = await fs.pathExists(filePath);
					expect(exists).toBe(true);
				}

				// Check unexpected files don't exist
				for (const file of config.unexpectedFiles) {
					const filePath = path.join(projectPath, file);
					const exists = await fs.pathExists(filePath);
					expect(exists).toBe(false);
				}
			});

			if (config.typecheck) {
				it("should pass TypeScript type checking", async () => {
					// Setup environment if needed
					if (config.requiresEnvSetup) {
						await setupEnvironment(projectPath);
					}

					// Run typecheck
					const { stderr } = await execAsync("npm run typecheck", {
						cwd: projectPath,
					});

					expect(stderr).toBe("");
				});
			}
		});
	});
});

async function setupEnvironment(projectPath: string): Promise<void> {
	// Create .dev.vars if needed
	const devVarsPath = path.join(projectPath, ".dev.vars");
	if (!(await fs.pathExists(devVarsPath))) {
		const content = `ENVIRONMENT=development
BETTER_AUTH_SECRET=test-secret
DISCORD_CLIENT_ID=test-client-id
DISCORD_CLIENT_SECRET=test-client-secret`;
		await fs.writeFile(devVarsPath, content);
	}

	// Generate types
	await execAsync("npm run gen:types", { cwd: projectPath });
}
