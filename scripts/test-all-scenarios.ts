#!/usr/bin/env bun

import { exec } from "node:child_process";
import fs from "fs-extra";
import path from "node:path";
import { promisify } from "node:util";
import kleur from "kleur";

const execAsync = promisify(exec);

// Configuration
const TEST_OUTPUT_DIR = path.join(process.cwd(), "test-output");
const KEEP_FAILED = process.argv.includes("--keep-failed");
const RUN_PARALLEL = process.argv.includes("--parallel");

// Test scenarios
interface TestScenario {
	name: string;
	projectName: string;
	command: string;
	needsDevVars: boolean;
	projectType: "api-only" | "full-stack";
}

const scenarios: TestScenario[] = [
	// API-only scenarios
	{
		name: "API-only: DB + Auth",
		projectName: "test-api-db-auth",
		command: "bunx create-vino-app test-api-db-auth --type=api-only -y",
		needsDevVars: true,
		projectType: "api-only",
	},
	{
		name: "API-only: DB, No Auth",
		projectName: "test-api-db-noauth",
		command: "bunx create-vino-app test-api-db-noauth --type=api-only --no-auth -y",
		needsDevVars: false,
		projectType: "api-only",
	},
	{
		name: "API-only: No DB, No Auth",
		projectName: "test-api-nodb-noauth",
		command: "bunx create-vino-app test-api-nodb-noauth --type=api-only --no-db -y",
		needsDevVars: false,
		projectType: "api-only",
	},
	// Full-stack scenarios
	{
		name: "Full-stack: DB + Auth",
		projectName: "test-full-db-auth",
		command: "bunx create-vino-app test-full-db-auth -y",
		needsDevVars: true,
		projectType: "full-stack",
	},
	{
		name: "Full-stack: DB, No Auth",
		projectName: "test-full-db-noauth",
		command: "bunx create-vino-app test-full-db-noauth --no-auth -y",
		needsDevVars: false,
		projectType: "full-stack",
	},
	{
		name: "Full-stack: No DB, No Auth",
		projectName: "test-full-nodb-noauth",
		command: "bunx create-vino-app test-full-nodb-noauth --no-db -y",
		needsDevVars: false,
		projectType: "full-stack",
	},
];

// Dev vars content for auth scenarios
const DEV_VARS_CONTENT = `# 本地开发环境变量
ENVIRONMENT=development

# Better Auth 配置
BETTER_AUTH_SECRET=development-secret-key-change-in-production

# Discord OAuth 应用配置
# 需要从 https://discord.com/developers/applications 获取真实值
DISCORD_CLIENT_ID=placeholder
DISCORD_CLIENT_SECRET=placeholder
`;

// Test result tracking
interface TestResult {
	scenario: string;
	success: boolean;
	error?: string;
	duration: number;
}

const results: TestResult[] = [];

// Helper functions
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

async function createDevVarsFile(projectPath: string) {
	const devVarsPath = path.join(projectPath, ".dev.vars");
	await fs.writeFile(devVarsPath, DEV_VARS_CONTENT);
}

async function testScenario(scenario: TestScenario): Promise<TestResult> {
	const startTime = Date.now();
	const projectPath = path.join(TEST_OUTPUT_DIR, scenario.projectName);

	console.log(`\n${kleur.blue("▶")} Testing: ${kleur.bold(scenario.name)}`);

	try {
		// Step 1: Create project
		console.log(`  ${kleur.dim("→")} Creating project...`);
		await runCommand(scenario.command, TEST_OUTPUT_DIR);

		// Step 2: Add .dev.vars if needed
		if (scenario.needsDevVars) {
			console.log(`  ${kleur.dim("→")} Adding .dev.vars file...`);
			await createDevVarsFile(projectPath);
		}

		// Step 3: Change to project directory and run initialization
		console.log(`  ${kleur.dim("→")} Running project initialization...`);
		process.chdir(projectPath);

		// Run initialization commands
		if (scenario.needsDevVars) {
			// For auth scenarios, we need to run gen:types first to generate worker-configuration.d.ts
			await runCommand("bun run gen:types");
		}

		// Step 4: Run lint:fix
		console.log(`  ${kleur.dim("→")} Running lint:fix...`);
		try {
			await runCommand("bun run lint:fix");
			console.log(`  ${kleur.green("✓")} lint:fix passed`);
		} catch (error: any) {
			throw new Error(`lint:fix failed: ${error.message}`);
		}

		// Step 5: Run typecheck
		console.log(`  ${kleur.dim("→")} Running typecheck...`);
		try {
			await runCommand("bun run typecheck");
			console.log(`  ${kleur.green("✓")} typecheck passed`);
		} catch (error: any) {
			throw new Error(`typecheck failed: ${error.message}`);
		}

		// Success!
		const duration = Date.now() - startTime;
		console.log(
			`${kleur.green("✓")} ${scenario.name} completed in ${(duration / 1000).toFixed(2)}s`,
		);

		// Clean up successful test
		if (!KEEP_FAILED) {
			process.chdir(TEST_OUTPUT_DIR);
			await fs.remove(projectPath);
		}

		return {
			scenario: scenario.name,
			success: true,
			duration,
		};
	} catch (error: any) {
		const duration = Date.now() - startTime;
		console.error(`${kleur.red("✗")} ${scenario.name} failed:`);
		console.error(`  ${kleur.red(error.message)}`);

		// Keep failed test output for debugging
		if (KEEP_FAILED) {
			console.log(
				`  ${kleur.yellow("!")} Failed test output kept at: ${projectPath}`,
			);
		} else {
			// Clean up failed test
			process.chdir(TEST_OUTPUT_DIR);
			await fs.remove(projectPath).catch(() => {});
		}

		return {
			scenario: scenario.name,
			success: false,
			error: error.message,
			duration,
		};
	}
}

async function runAllTests() {
	console.log(kleur.bold("\n🧪 Testing all create-vino-app scenarios\n"));
	console.log(`Output directory: ${kleur.cyan(TEST_OUTPUT_DIR)}`);
	console.log(`Keep failed tests: ${kleur.cyan(KEEP_FAILED ? "Yes" : "No")}`);
	console.log(`Run mode: ${kleur.cyan(RUN_PARALLEL ? "Parallel" : "Sequential")}\n`);

	// Ensure test output directory exists
	await fs.ensureDir(TEST_OUTPUT_DIR);

	// Save current directory
	const originalCwd = process.cwd();

	try {
		if (RUN_PARALLEL) {
			// Run tests in parallel
			const promises = scenarios.map((scenario) => testScenario(scenario));
			const testResults = await Promise.all(promises);
			results.push(...testResults);
		} else {
			// Run tests sequentially
			for (const scenario of scenarios) {
				const result = await testScenario(scenario);
				results.push(result);
			}
		}
	} finally {
		// Restore original directory
		process.chdir(originalCwd);
	}

	// Print summary
	console.log("\n" + kleur.bold("📊 Test Summary"));
	console.log("═".repeat(60));

	const successCount = results.filter((r) => r.success).length;
	const failCount = results.filter((r) => !r.success).length;

	for (const result of results) {
		const status = result.success
			? kleur.green("✓ PASS")
			: kleur.red("✗ FAIL");
		const time = `(${(result.duration / 1000).toFixed(2)}s)`;
		console.log(`${status} ${result.scenario} ${kleur.dim(time)}`);
		if (!result.success && result.error) {
			console.log(`      ${kleur.red("→")} ${result.error.split("\n")[0]}`);
		}
	}

	console.log("═".repeat(60));
	console.log(
		`Total: ${results.length} | ` +
			`${kleur.green(`Pass: ${successCount}`)} | ` +
			`${kleur.red(`Fail: ${failCount}`)}`,
	);

	// Clean up test output directory if all tests passed and not keeping
	if (failCount === 0 && !KEEP_FAILED) {
		await fs.remove(TEST_OUTPUT_DIR);
	}

	// Exit with appropriate code
	process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
	console.error(kleur.red("\n❌ Test runner failed:"));
	console.error(error);
	process.exit(1);
});