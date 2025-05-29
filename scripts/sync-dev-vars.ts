#!/usr/bin/env bun
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Convert .env file to .dev.vars format for Cloudflare
 * This removes quotes from values and preserves the key-value structure
 */
function convertEnvToDevVars() {
	try {
		// Read .env file
		const envPath = resolve(process.cwd(), ".env");
		const devVarsPath = resolve(process.cwd(), ".dev.vars");

		console.log("Reading from", envPath);
		const envContent = readFileSync(envPath, "utf-8");

		// Parse and transform content
		const transformedContent = envContent
			.split("\n")
			.filter((line) => {
				// Skip empty lines and comments
				return line.trim() !== "" && !line.trim().startsWith("#");
			})
			.map((line) => {
				// Find the first equals sign (separator between key and value)
				const equalIndex = line.indexOf("=");
				if (equalIndex === -1) return line;

				const key = line.substring(0, equalIndex).trim();
				let value = line.substring(equalIndex + 1).trim();

				// Remove quotes if present
				if (
					(value.startsWith('"') && value.endsWith('"')) ||
					(value.startsWith("'") && value.endsWith("'"))
				) {
					value = value.substring(1, value.length - 1);
				}

				return `${key}=${value}`;
			})
			.join("\n");

		// Write to .dev.vars
		writeFileSync(devVarsPath, transformedContent);
		console.log("Successfully converted .env to .dev.vars at", devVarsPath);
	} catch (error) {
		console.error("Error converting .env to .dev.vars:", error);
		process.exit(1);
	}
}

// Run the conversion
convertEnvToDevVars();
