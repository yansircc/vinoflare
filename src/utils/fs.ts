/**
 * @deprecated This file has been deprecated in favor of file-operations.ts
 * 
 * All functionality has been moved to the FileOperations class:
 * - readFile() -> FileOperations.read()
 * - writeFile() -> FileOperations.write()
 * - copyTemplate() -> FileOperations.copy()
 * - removeFiles() -> FileOperations.removeFiles()
 * - pathExists() -> FileOperations.exists()
 * - ensureDir() -> FileOperations.ensureDir()
 * - readJSON() -> FileOperations.readJSON()
 * - writeJSON() -> FileOperations.writeJSON()
 * - updateTextFile() -> FileOperations.updateTextFile()
 * - findFiles() -> FileOperations.glob()
 * 
 * Usage:
 * ```
 * import { createFileOperations } from "./file-operations";
 * const fileOps = createFileOperations(basePath);
 * await fileOps.read("file.txt");
 * ```
 */

// Re-export from file-operations for backward compatibility
export { pathExists, readJSON, writeJSON } from "fs-extra";

// Legacy removeFiles function that's still used in some places
export async function removeFiles(projectPath: string, files: string[]): Promise<void> {
	const { createFileOperations } = await import("./file-operations");
	const fileOps = createFileOperations(projectPath);
	await fileOps.removeFiles(files);
}