import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathExists } from "./fs-extra-wrapper";

/**
 * Find the project root by looking for package.json
 * This works both in development and when installed as a package
 */
export async function findProjectRoot(startPath?: string): Promise<string> {
	const currentFilePath = startPath || fileURLToPath(import.meta.url);
	let currentDir = path.dirname(currentFilePath);
	
	// Look up the directory tree for package.json with name "create-vino-app"
	while (currentDir !== path.dirname(currentDir)) {
		const packageJsonPath = path.join(currentDir, "package.json");
		
		if (await pathExists(packageJsonPath)) {
			try {
				const { readJSON } = await import("./fs-extra-wrapper");
				const packageJson = await readJSON(packageJsonPath);
				
				if (packageJson.name === "create-vino-app") {
					return currentDir;
				}
			} catch {
				// Continue searching up
			}
		}
		
		currentDir = path.dirname(currentDir);
	}
	
	// If not found, return the directory two levels up from src
	// This handles the development case where we're in src/utils/
	return path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

/**
 * Get the templates directory path
 * This function handles both development and production environments
 */
export async function getTemplatesDir(): Promise<string> {
	const projectRoot = await findProjectRoot();
	const templatesDir = path.join(projectRoot, "templates");
	
	// In development, templates are at project root
	if (await pathExists(templatesDir)) {
		return templatesDir;
	}
	
	// In production (when installed), templates might be in the package directory
	// Try to find templates relative to the current file
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const possiblePaths = [
		path.join(__dirname, "../../templates"), // From utils directory
		path.join(__dirname, "../templates"),    // From src directory
		path.join(__dirname, "templates"),       // Same directory
	];
	
	for (const possiblePath of possiblePaths) {
		if (await pathExists(possiblePath)) {
			return possiblePath;
		}
	}
	
	// Default to expected location
	return templatesDir;
}