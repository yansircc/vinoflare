#!/usr/bin/env bun
/**
 * Generate OpenAPI JSON file dynamically without Vite dependencies
 * This script scans the modules directory and loads modules dynamically
 * 
 * Usage: bun scripts/generate-openapi-dynamic.ts
 */

import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// OpenAPI specification configuration
const openAPIConfig = {
	title: "Vinoflare API",
	version: "1.0.0",
	description: "REST API for Vinoflare application",
	contact: {
		name: "API Support",
		email: "support@vinoflare.com",
	},
	servers: [
		{
			url: "/api",
			description: "API Server",
		},
	],
};

// Mock Hono Context for API Builder
class MockContext {
	constructor() {}
	json(data: any, status?: number) {
		return { data, status };
	}
	get(key: string) {
		return null;
	}
}

// Mock middleware
const mockMiddleware = () => async (c: any, next: any) => next?.();

async function generateDynamicOpenAPI() {
	try {
		console.log("🔧 Generating OpenAPI specification dynamically...");

		// Scan modules directory
		const modulesDir = resolve(__dirname, "../src/server/modules");
		const moduleNames = readdirSync(modulesDir, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		console.log(`📦 Found modules: ${moduleNames.join(", ")}`);

		const modules: any[] = [];

		// Dynamically import each module
		for (const moduleName of moduleNames) {
			try {
				const modulePath = `../src/server/modules/${moduleName}/index.ts`;
				console.log(`  📂 Loading module: ${moduleName}`);
				
				// Import the module
				const moduleExports = await import(modulePath);
				const moduleDefinition = moduleExports.default;
				
				if (moduleDefinition && typeof moduleDefinition.createModule === 'function') {
					modules.push(moduleDefinition);
					console.log(`    ✓ Loaded successfully`);
				} else {
					console.warn(`    ⚠️  No valid module definition found`);
				}
			} catch (error) {
				console.warn(`    ⚠️  Failed to load module ${moduleName}:`, error instanceof Error ? error.message : error);
			}
		}

		console.log(`\n📊 Successfully loaded ${modules.length} modules`);

		// Create OpenAPI spec
		const spec = {
			openapi: "3.0.0",
			info: {
				title: openAPIConfig.title,
				version: openAPIConfig.version,
				description: openAPIConfig.description,
				contact: openAPIConfig.contact,
			},
			servers: openAPIConfig.servers,
			paths: {} as Record<string, any>,
			components: {
				schemas: {},
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
					},
				},
			},
		};

		// Process each module
		for (const moduleDefinition of modules) {
			try {
				console.log(`\n🔄 Processing module: ${moduleDefinition.name}`);
				
				// Create module instance
				const moduleInstance = moduleDefinition.createModule();
				
				// Check if module has generateOpenAPISpec method
				if (typeof moduleInstance.generateOpenAPISpec === 'function') {
					const moduleSpec = moduleInstance.generateOpenAPISpec({
						title: "",
						version: "",
					});
					
					// Add paths with module prefix
					for (const [path, operations] of Object.entries(moduleSpec.paths || {})) {
						let fullPath = moduleDefinition.basePath + path;
						if (fullPath.endsWith("/") && fullPath.length > 1) {
							fullPath = fullPath.slice(0, -1);
						}
						
						spec.paths[fullPath] = operations;
						console.log(`    ✓ Added endpoint: ${fullPath}`);
					}
					
					// Merge schemas if available
					if (moduleSpec.components?.schemas) {
						Object.assign(spec.components.schemas, moduleSpec.components.schemas);
					}
				} else {
					console.warn(`    ⚠️  Module doesn't support OpenAPI generation`);
				}
			} catch (error) {
				console.error(`    ❌ Error processing module ${moduleDefinition.name}:`, error);
			}
		}

		// Add global endpoints
		spec.paths["/health"] = {
			get: {
				tags: ["System"],
				summary: "Health check",
				description: "Check if the API is running",
				responses: {
					"200": {
						description: "API is healthy",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										status: { type: "string", enum: ["ok"] },
										timestamp: { type: "string", format: "date-time" },
									},
									required: ["status", "timestamp"],
								},
							},
						},
					},
				},
			},
		};

		console.log(`\n📋 Total endpoints: ${Object.keys(spec.paths).length}`);

		// Define output path
		const outputDir = resolve(__dirname, "../src/generated");
		const outputPath = resolve(outputDir, "openapi.json");

		// Ensure directory exists
		mkdirSync(outputDir, { recursive: true });

		// Write to file
		writeFileSync(outputPath, JSON.stringify(spec));

		console.log(`\n✅ OpenAPI specification generated successfully!`);
		console.log(`📁 Output: ${outputPath}`);

		// Exit successfully
		process.exit(0);
	} catch (error) {
		console.error("❌ Error generating OpenAPI spec:", error);
		console.error("\n💡 Stack trace:", error instanceof Error ? error.stack : "");
		process.exit(1);
	}
}

// Run the generator
generateDynamicOpenAPI();