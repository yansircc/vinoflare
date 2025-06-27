#!/usr/bin/env bun

import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import fs from "fs-extra";
import kleur from "kleur";

const execAsync = promisify(exec);

// Configuration
const TEST_OUTPUT_DIR = path.join(process.cwd(), "test-output");
const KEEP_FAILED = process.argv.includes("--keep-failed");
const RUN_PARALLEL = process.argv.includes("--parallel");
const DEBUG = process.argv.includes("--debug");
const SAVE_LOGS = process.argv.includes("--save-logs");
const LOG_DIR = path.join(process.cwd(), "test-logs");

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
		command: `bunx create-vino-app test-api-db-auth --type=api-only -y`,
		needsDevVars: true,
		projectType: "api-only",
	},
	{
		name: "API-only: DB, No Auth",
		projectName: "test-api-db-noauth",
		command: `bunx create-vino-app test-api-db-noauth --type=api-only --no-auth -y`,
		needsDevVars: false,
		projectType: "api-only",
	},
	{
		name: "API-only: No DB, No Auth",
		projectName: "test-api-nodb-noauth",
		command: `bunx create-vino-app test-api-nodb-noauth --type=api-only --no-db -y`,
		needsDevVars: false,
		projectType: "api-only",
	},
	// Full-stack scenarios
	{
		name: "Full-stack: DB + Auth",
		projectName: "test-full-db-auth",
		command: `bunx create-vino-app test-full-db-auth -y`,
		needsDevVars: true,
		projectType: "full-stack",
	},
	{
		name: "Full-stack: DB, No Auth",
		projectName: "test-full-db-noauth",
		command: `bunx create-vino-app test-full-db-noauth --no-auth -y`,
		needsDevVars: false,
		projectType: "full-stack",
	},
	{
		name: "Full-stack: No DB, No Auth",
		projectName: "test-full-nodb-noauth",
		command: `bunx create-vino-app test-full-nodb-noauth --no-db -y`,
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
	logs?: string[];
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
		// Include stderr in the error message for better debugging
		const errorDetails = error.stderr || error.message || "Unknown error";
		throw new Error(`Command failed: ${command}\n${errorDetails}`);
	}
}

async function createDevVarsFile(projectPath: string) {
	const devVarsPath = path.join(projectPath, ".dev.vars");
	await fs.writeFile(devVarsPath, DEV_VARS_CONTENT);
}

async function testScenario(scenario: TestScenario): Promise<TestResult> {
	const startTime = Date.now();
	const projectPath = path.join(TEST_OUTPUT_DIR, scenario.projectName);
	const logs: string[] = [];

	console.log(`\n${kleur.blue("▶")} Testing: ${kleur.bold(scenario.name)}`);

	try {
		// Step 1: Create project
		console.log(`  ${kleur.dim("→")} Creating project...`);
		logs.push(`Creating project with command: ${scenario.command}`);

		try {
			const { stdout, stderr } = await runCommand(
				scenario.command,
				TEST_OUTPUT_DIR,
			);
			if (stdout) logs.push(`STDOUT: ${stdout}`);
			if (stderr) logs.push(`STDERR: ${stderr}`);
		} catch (createError: any) {
			// For project creation failures, save detailed error info
			logs.push(`ERROR: Project creation failed`);
			logs.push(`Command: ${scenario.command}`);
			logs.push(`Error: ${createError.message}`);

			// Save logs if requested
			if (SAVE_LOGS) {
				const logFile = path.join(
					LOG_DIR,
					`${scenario.projectName}-create.log`,
				);
				await fs.ensureDir(LOG_DIR);
				await fs.writeFile(logFile, logs.join("\n"));
				console.error(`  ${kleur.yellow("!")} Logs saved to: ${logFile}`);
			}

			console.error(`  ${kleur.red("✗")} Project creation failed`);
			console.error(`  ${kleur.gray("See logs for details")}`);
			throw createError;
		}

		// Step 2: Add .dev.vars if needed
		if (scenario.needsDevVars) {
			console.log(`  ${kleur.dim("→")} Adding .dev.vars file...`);
			await createDevVarsFile(projectPath);
		}

		// Step 3: Run initialization in project directory (without changing process.cwd)
		console.log(`  ${kleur.dim("→")} Running project initialization...`);

		// Debug: Check key files before initialization
		if (DEBUG) {
			const filesToCheck = [
				"src/server/lib/types.ts",
				"src/server/routes/api.ts",
				"src/server/openapi/schemas.ts",
				"src/client/hooks/use-posts.ts",
				"src/client/components/posts-list.tsx",
			];

			console.log(
				`  ${kleur.blue("[DEBUG]")} Checking files after project creation:`,
			);
			for (const file of filesToCheck) {
				const filePath = path.join(projectPath, file);
				if (await fs.pathExists(filePath)) {
					const content = await fs.readFile(filePath, "utf-8");
					const lines = content.split("\n").length;
					console.log(`    ${kleur.gray(file)}: ${lines} lines`);
					if (lines === 0 || content.trim() === "") {
						console.log(`      ${kleur.yellow("⚠ File is empty!")}`);
					}
				} else {
					console.log(`    ${kleur.gray(file)}: ${kleur.red("REMOVED ✓")}`);
				}
			}
		}

		// Run initialization commands
		if (scenario.needsDevVars) {
			// For auth scenarios, we need to run gen:types first to generate worker-configuration.d.ts
			await runCommand("bun run gen:types", projectPath);
		}

		// For full-stack projects with database, we need to run the full initialization
		// to generate the API client code that use-posts.ts depends on
		if (
			scenario.projectType === "full-stack" &&
			scenario.command.includes("--no-db") === false
		) {
			console.log(
				`  ${kleur.dim("→")} Running project initialization for database setup...`,
			);
			logs.push(`Running initialization for database project`);

			// Run the same initialization that would happen in ProjectInitProcessor
			await runCommand("bun run gen:routes", projectPath);
			await runCommand("bun run db:generate", projectPath);
			await runCommand("bun run db:push:local", projectPath);
			await runCommand("bun run gen:api", projectPath);
		}

		// Step 4: Run lint:fix
		console.log(`  ${kleur.dim("→")} Running lint:fix...`);
		logs.push(`Running lint:fix in ${projectPath}`);

		try {
			const { stdout, stderr } = await runCommand(
				"bun run lint:fix",
				projectPath,
			);
			if (stdout) logs.push(`Lint STDOUT: ${stdout}`);
			if (stderr) logs.push(`Lint STDERR: ${stderr}`);
			console.log(`  ${kleur.green("✓")} lint:fix passed`);
		} catch (error: any) {
			logs.push(`Lint error: ${error.message}`);
			throw new Error(`lint:fix failed: ${error.message}`);
		}

		// Step 5: Run typecheck
		console.log(`  ${kleur.dim("→")} Running typecheck...`);
		logs.push(`Running typecheck in ${projectPath}`);

		try {
			const { stdout, stderr } = await runCommand(
				"bun run typecheck",
				projectPath,
			);
			if (stdout) logs.push(`Typecheck STDOUT: ${stdout}`);
			if (stderr) logs.push(`Typecheck STDERR: ${stderr}`);
			console.log(`  ${kleur.green("✓")} typecheck passed`);
		} catch (error: any) {
			// Get detailed typecheck errors
			try {
				const { stdout, stderr } = await execAsync(
					"bun run typecheck 2>&1 || true",
					{
						cwd: projectPath,
					},
				);
				const output = stdout || stderr || "";
				logs.push(`Typecheck output:\n${output}`);

				const lines = output.split("\n").filter((line) => line.trim());
				const errorLines = lines.filter((line) => line.includes("error TS"));
				const errors = errorLines.slice(0, 10); // Show first 10 errors

				// Also extract file paths with errors
				const fileErrors = lines.filter(
					(line) => line.includes(".ts(") || line.includes(".tsx("),
				);
				const uniqueFiles = [
					...new Set(
						fileErrors
							.map((line) => {
								const match = line.match(/([^:]+\.tsx?)\(/);
								return match ? match[1] : null;
							})
							.filter(Boolean),
					),
				];

				if (errors.length > 0) {
					console.error(
						`  ${kleur.red("✗")} TypeScript errors in ${uniqueFiles.length} files:`,
					);
					uniqueFiles
						.slice(0, 5)
						.forEach((file) => console.error(`    ${kleur.yellow(file)}`));
					errors.forEach((err) =>
						console.error(`    ${kleur.gray(err.trim())}`),
					);
					if (errorLines.length > 10) {
						console.error(
							`    ${kleur.gray(`... and ${errorLines.length - 10} more errors`)}`,
						);
					}
				}

				// Save detailed typecheck log
				if (SAVE_LOGS) {
					const logFile = path.join(
						LOG_DIR,
						`${scenario.projectName}-typecheck.log`,
					);
					await fs.ensureDir(LOG_DIR);
					await fs.writeFile(logFile, output);
					console.error(
						`  ${kleur.yellow("!")} Full typecheck output saved to: ${logFile}`,
					);
				}

				throw new Error(`typecheck failed with ${errorLines.length} errors`);
			} catch (execError) {
				logs.push(`Failed to get typecheck details: ${execError}`);
				throw new Error(`typecheck failed: ${error.message}`);
			}
		}

		// Success!
		const duration = Date.now() - startTime;
		console.log(
			`${kleur.green("✓")} ${scenario.name} completed in ${(duration / 1000).toFixed(2)}s`,
		);

		// Clean up successful test
		if (!KEEP_FAILED) {
			await fs.remove(projectPath);
		}

		return {
			scenario: scenario.name,
			success: true,
			duration,
			logs: SAVE_LOGS ? logs : undefined,
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
			await fs.remove(projectPath).catch(() => {});
		}

		// Save error logs
		if (SAVE_LOGS) {
			const logFile = path.join(LOG_DIR, `${scenario.projectName}-error.log`);
			await fs.ensureDir(LOG_DIR);
			await fs.writeFile(
				logFile,
				logs.join("\n") + "\n\nERROR:\n" + error.message,
			);
		}

		return {
			scenario: scenario.name,
			success: false,
			error: error.message,
			duration,
			logs: SAVE_LOGS ? logs : undefined,
		};
	}
}

async function runAllTests() {
	console.log(kleur.bold("\n🧪 Testing all create-vino-app scenarios\n"));
	console.log(`Output directory: ${kleur.cyan(TEST_OUTPUT_DIR)}`);
	console.log(`Keep failed tests: ${kleur.cyan(KEEP_FAILED ? "Yes" : "No")}`);
	console.log(`Save logs: ${kleur.cyan(SAVE_LOGS ? "Yes" : "No")}`);
	console.log(
		`Run mode: ${kleur.cyan(RUN_PARALLEL ? "Parallel" : "Sequential")}\n`,
	);

	// Ensure test output directory exists
	await fs.ensureDir(TEST_OUTPUT_DIR);

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

	// Print summary
	console.log("\n" + kleur.bold("📊 Test Summary"));
	console.log("═".repeat(60));

	const successCount = results.filter((r) => r.success).length;
	const failCount = results.filter((r) => !r.success).length;

	for (const result of results) {
		const status = result.success ? kleur.green("✓ PASS") : kleur.red("✗ FAIL");
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
