#!/usr/bin/env bun
/**
 * Fetch OpenAPI spec from running dev server
 * Make sure dev server is running before executing this script
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fetchOpenAPISpec() {
	try {
		console.log("🔧 Fetching OpenAPI specification from dev server...");
		
		// Try to fetch from local dev server
		const response = await fetch("http://localhost:5173/api/openapi.json");
		
		if (!response.ok) {
			throw new Error(
				`Failed to fetch OpenAPI spec: ${response.statusText}\nMake sure the dev server is running with 'bun run dev'`,
			);
		}

		const spec = await response.json();

		// Define output path
		const outputDir = resolve(__dirname, "../src/generated");
		const outputPath = resolve(outputDir, "openapi.json");

		// Ensure directory exists
		mkdirSync(outputDir, { recursive: true });

		// Write to file
		writeFileSync(outputPath, JSON.stringify(spec, null, 2));

		console.log(`✅ OpenAPI specification fetched successfully!`);
		console.log(`📁 Output: ${outputPath}`);
		console.log(`\n📝 You can now use this file with Orval:`);
		console.log(`   bun orval --config orval.config.ts`);
	} catch (error) {
		console.error("❌ Error fetching OpenAPI spec:", error);
		console.error("\n💡 Make sure the dev server is running with 'bun run dev'");
		process.exit(1);
	}
}

// Run the fetcher
fetchOpenAPISpec();