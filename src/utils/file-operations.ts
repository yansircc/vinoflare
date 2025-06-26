import path from "node:path";
import fs from "fs-extra";
import { glob } from "glob";

/**
 * Unified file operations with consistent error handling
 */
export class FileOperations {
	constructor(private readonly basePath: string) {}

	/**
	 * Read a file
	 */
	async read(filePath: string): Promise<string> {
		const fullPath = this.resolvePath(filePath);
		try {
			return await fs.readFile(fullPath, "utf-8");
		} catch (error: any) {
			throw new FileOperationError(`Failed to read file: ${filePath}`, error);
		}
	}

	/**
	 * Write a file
	 */
	async write(filePath: string, content: string): Promise<void> {
		const fullPath = this.resolvePath(filePath);
		try {
			await fs.ensureDir(path.dirname(fullPath));
			await fs.writeFile(fullPath, content, "utf-8");
		} catch (error: any) {
			throw new FileOperationError(`Failed to write file: ${filePath}`, error);
		}
	}

	/**
	 * Copy file or directory
	 */
	async copy(from: string, to: string): Promise<void> {
		const fromPath = this.resolvePath(from);
		const toPath = this.resolvePath(to);
		try {
			await fs.copy(fromPath, toPath);
		} catch (error: any) {
			throw new FileOperationError(`Failed to copy from ${from} to ${to}`, error);
		}
	}

	/**
	 * Remove file or directory
	 */
	async remove(filePath: string): Promise<void> {
		const fullPath = this.resolvePath(filePath);
		try {
			await fs.remove(fullPath);
		} catch (error: any) {
			throw new FileOperationError(`Failed to remove: ${filePath}`, error);
		}
	}

	/**
	 * Check if file or directory exists
	 */
	async exists(filePath: string): Promise<boolean> {
		const fullPath = this.resolvePath(filePath);
		try {
			return await fs.pathExists(fullPath);
		} catch {
			return false;
		}
	}

	/**
	 * Find files matching glob pattern
	 */
	async glob(pattern: string): Promise<string[]> {
		try {
			const files = await glob(pattern, {
				cwd: this.basePath,
				nodir: true,
			});
			return files.map((file: string) => path.relative(this.basePath, file));
		} catch (error: any) {
			throw new FileOperationError(`Failed to glob: ${pattern}`, error);
		}
	}

	/**
	 * Ensure directory exists
	 */
	async ensureDir(dirPath: string): Promise<void> {
		const fullPath = this.resolvePath(dirPath);
		try {
			await fs.ensureDir(fullPath);
		} catch (error: any) {
			throw new FileOperationError(`Failed to ensure directory: ${dirPath}`, error);
		}
	}

	/**
	 * Read JSON file
	 */
	async readJSON<T = any>(filePath: string): Promise<T> {
		const content = await this.read(filePath);
		try {
			return JSON.parse(content) as T;
		} catch (error: any) {
			throw new FileOperationError(`Failed to parse JSON: ${filePath}`, error);
		}
	}

	/**
	 * Write JSON file
	 */
	async writeJSON(filePath: string, data: any, spaces = 2): Promise<void> {
		const content = JSON.stringify(data, null, spaces);
		await this.write(filePath, content);
	}

	/**
	 * Update JSON file
	 */
	async updateJSON<T = any>(
		filePath: string,
		updater: (data: T) => T | Promise<T>,
	): Promise<void> {
		const data = await this.readJSON<T>(filePath);
		const updated = await updater(data);
		await this.writeJSON(filePath, updated);
	}

	/**
	 * Update a text file
	 */
	async updateTextFile(
		filePath: string,
		updater: (content: string) => string | Promise<string>,
	): Promise<void> {
		const content = await this.read(filePath);
		const updated = await updater(content);
		await this.write(filePath, updated);
	}

	/**
	 * Remove multiple files with glob support
	 */
	async removeFiles(patterns: string[]): Promise<void> {
		for (const pattern of patterns) {
			if (pattern.includes("*")) {
				// Handle glob patterns
				const files = await this.glob(pattern);
				for (const file of files) {
					await this.remove(file);
				}
			} else {
				// Handle regular paths
				try {
					await this.remove(pattern);
				} catch (error) {
					// Ignore errors for non-existent files
				}
			}
		}
	}

	/**
	 * Resolve path relative to base path
	 */
	private resolvePath(filePath: string): string {
		return path.isAbsolute(filePath) ? filePath : path.join(this.basePath, filePath);
	}
}

/**
 * Custom error class for file operations
 */
export class FileOperationError extends Error {
	constructor(message: string, public readonly cause?: Error) {
		super(message);
		this.name = "FileOperationError";
	}
}

/**
 * Create a file operations instance
 */
export function createFileOperations(basePath: string): FileOperations {
	return new FileOperations(basePath);
}