#!/usr/bin/env bun
/**
 * Generate OpenAPI JSON file without starting a server
 * Uses runtime module loading for Bun compatibility
 *
 * Usage: bun gen:openapi
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OpenAPIHono } from "@hono/zod-openapi";
import { loadModulesRuntime } from "../src/server/core/module-loader-runtime";
import { registerModules } from "../src/server/core/module-loader";
import type { BaseContext } from "../src/server/lib/worker-types";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Generate OpenAPI specification
const generateOpenAPISpec = async () => {
	try {
		console.log("🔧 Generating OpenAPI specification...");

		// Create a temporary app just for OpenAPI generation
		const app = new OpenAPIHono<BaseContext>();

		// Configure OpenAPI
		app.doc31("/openapi.json", {
			openapi: "3.0.0",
			info: {
				title: "Vinoflare API",
				version: "1.0.0",
				description: "API documentation for Vinoflare v2 application",
			},
			servers: [
				{
					url: "/api",
					description: "API server",
				},
			],
		});

		// Load modules using runtime loader
		const modules = await loadModulesRuntime();
		console.log(`📦 Loaded ${modules.length} modules`);

		// Register modules with the app
		registerModules(app, modules);

		// Generate the OpenAPI spec
		const response = await app.request("/openapi.json");
		const spec = await response.json();

		// Remove webhooks field that causes validation warnings
		if ('webhooks' in spec) {
			delete spec.webhooks;
		}

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