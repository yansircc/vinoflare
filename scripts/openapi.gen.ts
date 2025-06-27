#!/usr/bin/env bun
/**
 * Generate OpenAPI JSON file without starting a server
 * Uses Hono's request method to simulate HTTP calls
 *
 * Usage: bun gen:openapi
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import app from "../src/index";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Generate OpenAPI specification
const generateOpenAPISpec = async () => {
	try {
		console.log("🔧 Generating OpenAPI specification...");

		// Fetch the OpenAPI spec from the app using Hono's request method
		const response = await app.request("/api/openapi.json");

		if (!response.ok) {
			throw new Error(
				`Failed to generate OpenAPI spec: ${response.statusText}`,
			);
		}

		const spec = await response.json();

		// Define output path (now in src/generated)
		const outputDir = resolve(__dirname, "../src/generated");
		const outputPath = resolve(outputDir, "openapi.json");

		// Ensure directory exists
		mkdirSync(outputDir, { recursive: true });

		// Write to file
		writeFileSync(outputPath, JSON.stringify(spec, null, 2));

		console.log(`✅ OpenAPI specification generated successfully!`);
		console.log(`📁 Output: ${outputPath}`);
		console.log(`\n📝 You can now use this file with Orval:`);
		console.log(`   bun orval --config orval.config.ts`);
	} catch (error) {
		console.error("❌ Error generating OpenAPI spec:", error);
		process.exit(1);
	}
};

// Run the generator
generateOpenAPISpec();
