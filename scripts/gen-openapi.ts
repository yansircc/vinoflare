#!/usr/bin/env bun
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import app from "../src/index";

// Generate OpenAPI specification
const generateOpenAPISpec = async () => {
	try {
		// Fetch the OpenAPI spec from the app
		const response = await app.request("/doc");

		if (!response.ok) {
			throw new Error(
				`Failed to generate OpenAPI spec: ${response.statusText}`,
			);
		}

		const spec = await response.json();

		// Write to file
		const outputPath = resolve(process.cwd(), "openapi.json");
		writeFileSync(outputPath, JSON.stringify(spec, null, 2));

		console.log(`✅ OpenAPI spec generated successfully at: ${outputPath}`);
	} catch (error) {
		console.error("❌ Error generating OpenAPI spec:", error);
		process.exit(1);
	}
};

// Run the generator
generateOpenAPISpec();
