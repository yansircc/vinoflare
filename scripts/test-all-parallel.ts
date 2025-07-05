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

interface TestResult {
	scenario: TestScenario;
	success: boolean;
	duration: number;
	error?: string;
	errorDetails?: string;
}

const scenarios: TestScenario[] = [
	// Orval (OpenAPI) based full-stack templates
	{
		name: "Full-stack: DB + Auth",
		projectName: "test-full-db-auth",
		command: `node ${CLI_PATH} test-full-db-auth --type=full-stack -y --no-git --pm=bun`,
		needsAuth: true,
	},
	{
		name: "Full-stack: DB, No Auth",
		projectName: "test-full-db-noauth",
		command: `node ${CLI_PATH} test-full-db-noauth --type=full-stack --no-auth -y --no-git --pm=bun`,
		needsAuth: false,
	},
	{
		name: "Full-stack: No DB, No Auth",
		projectName: "test-full-nodb-noauth",
		command: `node ${CLI_PATH} test-full-nodb-noauth --type=full-stack --no-db -y --no-git --pm=bun`,
		needsAuth: false,
	},
	// Hono RPC based full-stack templates
	{
		name: "Full-stack RPC: DB + Auth",
		projectName: "test-full-rpc-db-auth",
		command: `node ${CLI_PATH} test-full-rpc-db-auth --type=full-stack --rpc -y --no-git --pm=bun`,
		needsAuth: true,
	},
	{
		name: "Full-stack RPC: DB, No Auth",
		projectName: "test-full-rpc-db-noauth",
		command: `node ${CLI_PATH} test-full-rpc-db-noauth --type=full-stack --rpc --no-auth -y --no-git --pm=bun`,
		needsAuth: false,
	},
	{
		name: "Full-stack RPC: No DB, No Auth",
		projectName: "test-full-rpc-nodb-noauth",
		command: `node ${CLI_PATH} test-full-rpc-nodb-noauth --type=full-stack --rpc --no-db -y --no-git --pm=bun`,
		needsAuth: false,
	},
	// API-only templates
	{
		name: "API-only: DB + Auth",
		projectName: "test-api-db-auth",
		command: `node ${CLI_PATH} test-api-db-auth --type=api-only -y --no-git --pm=bun`,
		needsAuth: true,
	},
	{
		name: "API-only: DB, No Auth",
		projectName: "test-api-db-noauth",
		command: `node ${CLI_PATH} test-api-db-noauth --type=api-only --no-auth -y --no-git --pm=bun`,
		needsAuth: false,
	},
	{
		name: "API-only: No DB, No Auth",
		projectName: "test-api-nodb-noauth",
		command: `node ${CLI_PATH} test-api-nodb-noauth --type=api-only --no-db -y --no-git --pm=bun`,
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
			env: { ...process.env, FORCE_COLOR: "0" }, // Disable color for cleaner logs
		});
		return { stdout, stderr };
	} catch (error: any) {
		// Return the error output for analysis
		return {
			stdout: error.stdout || "",
			stderr: error.stderr || error.message,
		};
	}
}

async function testScenario(scenario: TestScenario): Promise<TestResult> {
	const startTime = Date.now();
	const projectPath = path.join(TEST_OUTPUT_DIR, scenario.projectName);
	const logFile = path.join(TEST_OUTPUT_DIR, `${scenario.projectName}.log`);
	let logContent = `Test: ${scenario.name}\nStarted: ${new Date().toISOString()}\n\n`;

	try {
		// Create project
		logContent += "=== Creating project ===\n";
		const createResult = await runCommand(scenario.command, TEST_OUTPUT_DIR);
		logContent += `STDOUT:\n${createResult.stdout}\n`;
		logContent += `STDERR:\n${createResult.stderr}\n\n`;

		if (!await fs.pathExists(projectPath)) {
			throw new Error("Project directory was not created");
		}

		// Setup based on project type
		const hasDb = !scenario.command.includes("--no-db");
		const hasAuth = scenario.needsAuth;
		const isFullStack = scenario.command.includes("--type=full-stack") || !scenario.command.includes("--type=");

		// Add .dev.vars if needed for auth
		if (hasAuth) {
			const devVarsContent = `# Environment variables for local development
ENVIRONMENT=development

# Better Auth Configuration
BETTER_AUTH_SECRET=test-secret-key-for-testing-only

# OAuth Providers
DISCORD_CLIENT_ID=test-discord-client-id
DISCORD_CLIENT_SECRET=test-discord-client-secret`;

			await fs.writeFile(path.join(projectPath, ".dev.vars"), devVarsContent);
			logContent += "=== Created .dev.vars for auth ===\n\n";
		}

		// Run setup commands
		if (hasDb) {
			logContent += "=== Running db:generate ===\n";
			const dbGenResult = await runCommand("bun run db:generate", projectPath);
			logContent += `STDOUT:\n${dbGenResult.stdout}\n`;
			logContent += `STDERR:\n${dbGenResult.stderr}\n\n`;

			logContent += "=== Running db:push:local ===\n";
			const dbPushResult = await runCommand("bun run db:push:local", projectPath);
			logContent += `STDOUT:\n${dbPushResult.stdout}\n`;
			logContent += `STDERR:\n${dbPushResult.stderr}\n\n`;

			logContent += "=== Running gen:types ===\n";
			const genTypesResult = await runCommand("bun run gen:types", projectPath);
			logContent += `STDOUT:\n${genTypesResult.stdout}\n`;
			logContent += `STDERR:\n${genTypesResult.stderr}\n\n`;
		}

		// Frontend setup
		if (isFullStack) {
			const generatedDir = path.join(projectPath, "src", "generated");
			await fs.ensureDir(generatedDir);
			
			logContent += "=== Running gen:routes ===\n";
			const genRoutesResult = await runCommand("bun run gen:routes", projectPath);
			logContent += `STDOUT:\n${genRoutesResult.stdout}\n`;
			logContent += `STDERR:\n${genRoutesResult.stderr}\n\n`;

			// Check if this is an RPC template
			const isRpc = scenario.command.includes("--rpc");
			if (isRpc) {
				logContent += "=== Running gen:client (RPC) ===\n";
				const genClientResult = await runCommand("bun run gen:client", projectPath);
				logContent += `STDOUT:\n${genClientResult.stdout}\n`;
				logContent += `STDERR:\n${genClientResult.stderr}\n\n`;
			} else {
				logContent += "=== Running gen:api (Orval) ===\n";
				const genApiResult = await runCommand("bun run gen:api", projectPath);
				logContent += `STDOUT:\n${genApiResult.stdout}\n`;
				logContent += `STDERR:\n${genApiResult.stderr}\n\n`;
			}

			logContent += "=== Running build ===\n";
			const buildResult = await runCommand("bun run build", projectPath);
			logContent += `STDOUT:\n${buildResult.stdout}\n`;
			logContent += `STDERR:\n${buildResult.stderr}\n\n`;
		}

		// Run lint:fix
		logContent += "=== Running lint:fix ===\n";
		const lintResult = await runCommand("bun run lint:fix", projectPath);
		logContent += `STDOUT:\n${lintResult.stdout}\n`;
		logContent += `STDERR:\n${lintResult.stderr}\n\n`;

		// Run typecheck
		logContent += "=== Running typecheck ===\n";
		const typecheckResult = await runCommand("bun run typecheck", projectPath);
		logContent += `STDOUT:\n${typecheckResult.stdout}\n`;
		logContent += `STDERR:\n${typecheckResult.stderr}\n\n`;

		// Run tests
		logContent += "=== Running tests ===\n";
		const testResult = await runCommand("bun run test", projectPath);
		logContent += `STDOUT:\n${testResult.stdout}\n`;
		logContent += `STDERR:\n${testResult.stderr}\n\n`;

		// Check if any command failed
		if (testResult.stderr && testResult.stderr.includes("error")) {
			throw new Error(`Tests failed: ${testResult.stderr}`);
		}

		// Clean up
		await fs.remove(projectPath);

		const duration = Date.now() - startTime;
		logContent += `\n=== SUCCESS ===\nCompleted in ${duration}ms\n`;
		await fs.writeFile(logFile, logContent);

		return {
			scenario,
			success: true,
			duration,
		};
	} catch (error: any) {
		const duration = Date.now() - startTime;
		logContent += `\n=== FAILED ===\nError: ${error.message}\nCompleted in ${duration}ms\n`;
		await fs.writeFile(logFile, logContent);

		// Clean up on failure
		await fs.remove(projectPath).catch(() => {});

		return {
			scenario,
			success: false,
			duration,
			error: error.message,
			errorDetails: logContent,
		};
	}
}

async function main() {
	console.log(kleur.bold("\n🧪 Testing all create-vinoflare scenarios (parallel)\n"));

	// Ensure test output directory exists
	await fs.ensureDir(TEST_OUTPUT_DIR);

	// Show progress header
	console.log(kleur.dim("Running tests in parallel..."));
	console.log(kleur.dim("─".repeat(60)));

	// Run all tests in parallel
	const startTime = Date.now();
	const resultsPromises = scenarios.map(scenario => testScenario(scenario));
	
	// Show progress as tests complete
	let completed = 0;
	resultsPromises.forEach(promise => {
		promise.then(result => {
			completed++;
			const status = result.success ? kleur.green("✓") : kleur.red("✗");
			const time = kleur.dim(`(${(result.duration / 1000).toFixed(1)}s)`);
			console.log(`${status} ${result.scenario.name} ${time}`);
			
			if (!result.success && result.error) {
				console.log(kleur.red(`  └─ ${result.error}`));
				console.log(kleur.dim(`  └─ See ${result.scenario.projectName}.log for details`));
			}
		});
	});

	// Wait for all tests to complete
	const results = await Promise.all(resultsPromises);
	const totalDuration = Date.now() - startTime;

	// Summary
	const successCount = results.filter(r => r.success).length;
	const failCount = results.filter(r => !r.success).length;

	console.log("\n" + kleur.bold("📊 Test Summary"));
	console.log("═".repeat(60));
	console.log(
		`Total: ${scenarios.length} | ` +
			`${kleur.green(`Pass: ${successCount}`)} | ` +
			`${kleur.red(`Fail: ${failCount}`)} | ` +
			`Time: ${(totalDuration / 1000).toFixed(1)}s`,
	);

	// Show failed test details
	const failedTests = results.filter(r => !r.success);
	if (failedTests.length > 0) {
		console.log("\n" + kleur.red("❌ Failed Tests:"));
		for (const failed of failedTests) {
			console.log(`\n${kleur.red("→")} ${failed.scenario.name}`);
			if (failed.error) {
				console.log(kleur.dim(`   Error: ${failed.error}`));
			}
			console.log(kleur.dim(`   Log file: ${path.join(TEST_OUTPUT_DIR, `${failed.scenario.projectName}.log`)}`));
		}
		console.log(`\n${kleur.yellow("💡")} Run 'cat test-output/<test-name>.log' to see detailed error output`);
	} else {
		// Clean up test output directory on success
		await fs.remove(TEST_OUTPUT_DIR);
	}

	process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error(kleur.red("\n❌ Test runner failed:"));
	console.error(error);
	process.exit(1);
});