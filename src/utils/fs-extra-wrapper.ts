/**
 * Wrapper for fs-extra to handle ESM/CJS compatibility
 */
import type { PathLike } from "node:fs";

// Dynamic import to handle CommonJS module in ESM context
const getFsExtra = async () => {
	const fsExtra = await import("fs-extra");
	return fsExtra.default || fsExtra;
};

export async function readJSON(file: PathLike): Promise<any> {
	const fs = await getFsExtra();
	return fs.readJSON(file);
}

export async function writeJSON(
	file: PathLike,
	object: any,
	options?: any,
): Promise<void> {
	const fs = await getFsExtra();
	return fs.writeJSON(file, object, options);
}

export async function pathExists(path: PathLike): Promise<boolean> {
	const fs = await getFsExtra();
	return fs.pathExists(path);
}

export async function ensureDir(path: PathLike): Promise<void> {
	const fs = await getFsExtra();
	return fs.ensureDir(path);
}

export async function remove(path: PathLike): Promise<void> {
	const fs = await getFsExtra();
	return fs.remove(path);
}

export async function copy(src: string, dest: string, options?: any): Promise<void> {
	const fs = await getFsExtra();
	return fs.copy(src, dest, options);
}

export async function emptyDir(path: PathLike): Promise<void> {
	const fs = await getFsExtra();
	return fs.emptyDir(path);
}

export async function readFile(path: PathLike, encoding?: any): Promise<any> {
	const fs = await getFsExtra();
	return fs.readFile(path, encoding);
}

export async function writeFile(
	path: PathLike,
	data: any,
	options?: any,
): Promise<void> {
	const fs = await getFsExtra();
	return fs.writeFile(path, data, options);
}