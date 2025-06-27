#!/usr/bin/env bun

import path from "node:path";
import { $ } from "bun";
import fs from "fs-extra";

const TEST_DIR = path.join(process.cwd(), "test-output");
const testName = "test-full-nodb-noauth";
const projectPath = path.join(TEST_DIR, testName);

async function runTest() {
	console.log("🧪 Running simple test...\n");

	// Ensure test directory exists
	await fs.ensureDir(TEST_DIR);

	// Remove existing test project if it exists
	await fs.remove(projectPath);

	try {
		// Step 1: Create project
		console.log("📦 Creating project...");
		const createResult = await $`bunx create-vino-app ${testName} --no-db -y`
			.cwd(TEST_DIR)
			.quiet();

		if (createResult.exitCode !== 0) {
			console.error("❌ Project creation failed");
			console.error("STDOUT:", createResult.stdout.toString());
			console.error("STDERR:", createResult.stderr.toString());
			process.exit(1);
		}

		console.log("✅ Project created successfully");

		// Step 2: Check if key files exist
		console.log("\n📁 Checking project structure...");
		const filesToCheck = [
			"package.json",
			"src/server/lib/types.ts",
			"src/server/routes/api.ts",
			"src/client/routes/__root.tsx",
			"src/client/routes/index.tsx",
		];

		for (const file of filesToCheck) {
			const filePath = path.join(projectPath, file);
			const exists = await fs.pathExists(filePath);
			console.log(`  ${exists ? "✅" : "❌"} ${file}`);

			if (exists) {
				const content = await fs.readFile(filePath, "utf-8");
				if (content.trim() === "") {
					console.log(`    ⚠️  File is empty!`);
				}
			}
		}

		// Step 3: Run typecheck
		console.log("\n🔍 Running typecheck...");
		const typecheckResult = await $`bun run typecheck`.cwd(projectPath).quiet();

		if (typecheckResult.exitCode !== 0) {
			console.error("❌ Typecheck failed");
			console.error("\nTypeScript errors:");
			const output =
				typecheckResult.stderr.toString() || typecheckResult.stdout.toString();
			const lines = output.split("\n");
			const errors = lines.filter((line) => line.includes("error TS"));
			errors.slice(0, 10).forEach((err) => console.error(`  ${err}`));

			// Save full output
			const logPath = path.join(process.cwd(), "test-simple-typecheck.log");
			await fs.writeFile(logPath, output);
			console.error(`\nFull output saved to: ${logPath}`);
		} else {
			console.log("✅ Typecheck passed");
		}
	} catch (error) {
		console.error("\n❌ Test failed with error:", error);
		process.exit(1);
	}
}

runTest();
