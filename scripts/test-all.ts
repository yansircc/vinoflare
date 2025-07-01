#!/usr/bin/env tsx

import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import fs from "fs-extra";
import kleur from "kleur";

const execAsync = promisify(exec);

const TEST_OUTPUT_DIR = path.join(process.cwd(), "test-output");
const CLI_PATH = path.join(process.cwd(), "dist", "index.js");

interface TestScenario {
	name: string;
	projectName: string;
	command: string;
	needsAuth: boolean;
}

const scenarios: TestScenario[] = [
	{
		name: "Full-stack: DB + Auth",
		projectName: "test-full-db-auth",
		command: `node ${CLI_PATH} test-full-db-auth --type=full-stack -y --no-git`,
		needsAuth: true,
	},
	{
		name: "Full-stack: DB, No Auth",
		projectName: "test-full-db-noauth",
		command: `node ${CLI_PATH} test-full-db-noauth --type=full-stack --no-auth -y --no-git`,
		needsAuth: false,
	},
	{
		name: "Full-stack: No DB, No Auth",
		projectName: "test-full-nodb-noauth",
		command: `node ${CLI_PATH} test-full-nodb-noauth --type=full-stack --no-db -y --no-git`,
		needsAuth: false,
	},
	{
		name: "API-only: DB + Auth",
		projectName: "test-api-db-auth",
		command: `node ${CLI_PATH} test-api-db-auth --type=api-only -y --no-git`,
		needsAuth: true,
	},
	{
		name: "API-only: DB, No Auth",
		projectName: "test-api-db-noauth",
		command: `node ${CLI_PATH} test-api-db-noauth --type=api-only --no-auth -y --no-git`,
		needsAuth: false,
	},
	{
		name: "API-only: No DB, No Auth",
		projectName: "test-api-nodb-noauth",
		command: `node ${CLI_PATH} test-api-nodb-noauth --type=api-only --no-db -y --no-git`,
		needsAuth: false,
	},
];

async function runCommand(
	command: string,
	cwd?: string,
): Promise<{ stdout: string; stderr: string }> {
	try {
		const { stdout, stderr } = await execAsync(command, {
			cwd,
			env: { ...process.env, FORCE_COLOR: "1" },
		});
		return { stdout, stderr };
	} catch (error: any) {
		throw new Error(`Command failed: ${command}\n${error.message}`);
	}
}

async function testScenario(scenario: TestScenario): Promise<boolean> {
	const projectPath = path.join(TEST_OUTPUT_DIR, scenario.projectName);

	console.log(`\n${kleur.blue("▶")} Testing: ${kleur.bold(scenario.name)}`);

	try {
		// Create project
		console.log(`  ${kleur.dim("→")} Creating project...`);
		await runCommand(scenario.command, TEST_OUTPUT_DIR);

		// Setup based on project type
		const hasDb = !scenario.command.includes("--no-db");
		const hasAuth = scenario.needsAuth;
		const isFullStack = scenario.command.includes("--type=full-stack") || !scenario.command.includes("--type=");

		// Add .dev.vars if needed for auth (MUST be done before gen:types)
		if (hasAuth) {
			const devVarsContent = `# Environment variables for local development
ENVIRONMENT=development

# Better Auth Configuration
BETTER_AUTH_SECRET=test-secret-key-for-testing-only

# OAuth Providers
DISCORD_CLIENT_ID=test-discord-client-id
DISCORD_CLIENT_SECRET=test-discord-client-secret`;

			await fs.writeFile(path.join(projectPath, ".dev.vars"), devVarsContent);
		}

		// Run setup commands
		console.log(`  ${kleur.dim("→")} Running setup commands...`);
		
		// Database setup (gen:types requires .dev.vars to exist for auth projects)
		if (hasDb) {
			await runCommand("bun run db:generate", projectPath);
			await runCommand("bun run db:push:local", projectPath);
			// For auth projects, gen:types reads .dev.vars
			await runCommand("bun run gen:types", projectPath);
		}

		// Frontend setup
		if (isFullStack) {
			// Ensure generated directory exists
			const generatedDir = path.join(projectPath, "src", "generated");
			await fs.ensureDir(generatedDir);
			
			await runCommand("bun run gen:routes", projectPath);
			await runCommand("bun run gen:api", projectPath);
			
			// Build is required for tests to run (creates dist/client)
			console.log(`  ${kleur.dim("→")} Building project...`);
			await runCommand("bun run build", projectPath);
		}

		// Run lint:fix
		console.log(`  ${kleur.dim("→")} Running lint:fix...`);
		await runCommand("bun run lint:fix", projectPath);
		console.log(`  ${kleur.green("✓")} lint:fix passed`);

		// Run typecheck
		console.log(`  ${kleur.dim("→")} Running typecheck...`);
		await runCommand("bun run typecheck", projectPath);
		console.log(`  ${kleur.green("✓")} typecheck passed`);

		// Run tests
		console.log(`  ${kleur.dim("→")} Running tests...`);
		await runCommand("bun run test", projectPath);
		console.log(`  ${kleur.green("✓")} tests passed`);

		// Clean up
		await fs.remove(projectPath);

		console.log(`${kleur.green("✓")} ${scenario.name} completed successfully`);
		return true;
	} catch (error: any) {
		console.error(`${kleur.red("✗")} ${scenario.name} failed:`);
		console.error(`  ${kleur.red(error.message.split("\n")[0])}`);

		// Clean up on failure
		await fs.remove(projectPath).catch(() => {});

		return false;
	}
}

async function main() {
	console.log(kleur.bold("\n🧪 Testing all create-vinoflare scenarios\n"));

	// Ensure test output directory exists
	await fs.ensureDir(TEST_OUTPUT_DIR);

	let successCount = 0;
	let failCount = 0;

	for (const scenario of scenarios) {
		const success = await testScenario(scenario);
		if (success) {
			successCount++;
		} else {
			failCount++;
		}
	}

	// Summary
	console.log("\n" + kleur.bold("📊 Test Summary"));
	console.log("═".repeat(60));
	console.log(
		`Total: ${scenarios.length} | ` +
			`${kleur.green(`Pass: ${successCount}`)} | ` +
			`${kleur.red(`Fail: ${failCount}`)}`,
	);

	// Clean up test output directory
	await fs.remove(TEST_OUTPUT_DIR);

	process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error(kleur.red("\n❌ Test runner failed:"));
	console.error(error);
	process.exit(1);
});
