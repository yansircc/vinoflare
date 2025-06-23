#!/usr/bin/env bun
// Universal API Client Generator for Hono + OpenAPI projects
// This generator creates TypeScript client code with full type safety

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ApiClientGenerator } from "./api-client-generator";
import { ReactQueryHookGenerator } from "./hook-generator";
import { OpenAPITypeGenerator } from "./type-generator";
import type { OpenAPISchema } from "./types";

// Main generator function
async function generateApiClient() {
	console.log("🚀 Starting universal API client generation...");

	try {
		// Dynamic import to get the app
		const { default: app } = await import("../../src/index");

		// Fetch OpenAPI spec
		const response = await app.request("/doc");
		const openApiSpec = (await response.json()) as OpenAPISchema;

		console.log(
			`📄 Loaded OpenAPI spec: ${openApiSpec.info.title} v${openApiSpec.info.version}`,
		);

		// Generate client
		const clientGenerator = new ApiClientGenerator(openApiSpec);
		const clientCode = clientGenerator.generateClient();

		// Generate hooks
		const typeGenerator = new OpenAPITypeGenerator(openApiSpec);
		const hookGenerator = new ReactQueryHookGenerator(
			openApiSpec,
			clientGenerator.routesMap,
			typeGenerator,
		);
		const hooksCode = hookGenerator.generateHooks();

		// Create output directory
		const outputDir = join(process.cwd(), "src/generated");
		await mkdir(outputDir, { recursive: true });

		// Write files
		await writeFile(join(outputDir, "client.ts"), clientCode);
		await writeFile(join(outputDir, "hooks.ts"), hooksCode);
		await writeFile(
			join(outputDir, "index.ts"),
			`export * from "./client";\nexport * from "./hooks";\n`,
		);

		console.log("✅ Universal API client generated successfully!");
		console.log("\n📊 Generated:");
		console.log(`   - ${clientGenerator.routesMap.size} API resources`);
		console.log(`   - Output directory: ${outputDir}`);
		console.log("\n📝 Files created:");
		console.log("   - src/generated/client.ts (API client)");
		console.log("   - src/generated/hooks.ts (React Query hooks)");
		console.log("   - src/generated/index.ts (barrel export)");
	} catch (error) {
		console.error("❌ Error generating API client:", error);
		process.exit(1);
	}
}

// Run the generator
generateApiClient().catch(console.error);
