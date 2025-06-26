import path from "node:path";
import fs from "fs-extra";

/**
 * File system utilities with error handling
 */

export async function removeFiles(
	projectPath: string,
	files: string[],
): Promise<void> {
	// Debug log to file
	await fs.appendFile(
		"removeFiles-debug.log",
		`\n[${new Date().toISOString()}] removeFiles called with projectPath: ${projectPath}\n`
	);
	await fs.appendFile(
		"removeFiles-debug.log",
		`Files to remove: ${files.join(", ")}\n`
	);
	
	const { glob } = await import("glob");
	
	for (const file of files) {
		// Handle glob patterns
		if (file.includes("*")) {
			const matches = await glob(file, {
				cwd: projectPath,
				absolute: true,
			});
			for (const match of matches) {
				if (await fs.pathExists(match)) {
					await fs.remove(match);
					await fs.appendFile("removeFiles-debug.log", `[DEBUG] Removed (glob): ${match}\n`);
				}
			}
		} else {
			// Handle regular files
			const fullPath = path.join(projectPath, file);
			if (await fs.pathExists(fullPath)) {
				await fs.remove(fullPath);
				await fs.appendFile("removeFiles-debug.log", `[DEBUG] Removed: ${fullPath}\n`);
			} else {
				await fs.appendFile("removeFiles-debug.log", `[DEBUG] File not found: ${fullPath}\n`);
			}
		}
	}
}

export async function copyTemplate(src: string, dest: string): Promise<void> {
	await fs.copy(src, dest, {
		overwrite: true,
		errorOnExist: false,
	});
}

export async function readJSON<T = any>(filePath: string): Promise<T> {
	return fs.readJSON(filePath);
}

export async function writeJSON(
	filePath: string,
	data: any,
	spaces = 2,
): Promise<void> {
	await fs.writeJSON(filePath, data, { spaces });
}

export async function updateTextFile(
	filePath: string,
	updater: (content: string) => string,
): Promise<void> {
	if (!(await fs.pathExists(filePath))) {
		throw new Error(`File not found: ${filePath}`);
	}

	const content = await fs.readFile(filePath, "utf-8");
	const updated = updater(content);
	await fs.writeFile(filePath, updated);
}

export async function ensureDir(dirPath: string): Promise<void> {
	await fs.ensureDir(dirPath);
}

export async function pathExists(filePath: string): Promise<boolean> {
	return fs.pathExists(filePath);
}

export async function readFile(filePath: string): Promise<string> {
	return fs.readFile(filePath, "utf-8");
}

export async function writeFile(
	filePath: string,
	content: string,
): Promise<void> {
	await fs.writeFile(filePath, content);
}

/**
 * Find files matching glob patterns
 */
export async function findFiles(
	baseDir: string,
	patterns: string[],
): Promise<string[]> {
	const { glob } = await import("glob");
	const files: string[] = [];

	for (const pattern of patterns) {
		const matches = await glob(pattern, {
			cwd: baseDir,
			nodir: true,
		});
		files.push(...matches);
	}

	return [...new Set(files)]; // Remove duplicates
}
