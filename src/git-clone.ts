import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import type { BranchName } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map branch names to template directories
const branchToTemplateMap: Record<BranchName, string> = {
	"main": "full-stack",
	"full-stack-no-auth": "full-stack-no-auth",
	"full-stack-no-auth-no-db": "full-stack-no-db",
	"api-only": "api-only",
	"api-only-no-auth": "api-only-no-auth",
	"api-only-no-auth-no-db": "api-only-no-db",
};

// Find the package root (where package.json is located)
function findPackageRoot(startPath: string): string {
	let currentPath = startPath;
	while (currentPath !== path.parse(currentPath).root) {
		if (fs.existsSync(path.join(currentPath, "package.json"))) {
			// Check if this is the create-vinoflare package
			try {
				const pkg = fs.readJsonSync(path.join(currentPath, "package.json"));
				if (pkg.name === "create-vinoflare") {
					return currentPath;
				}
			} catch {
				// Continue searching
			}
		}
		currentPath = path.dirname(currentPath);
	}
	throw new Error("Could not find create-vinoflare package root");
}

export async function cloneTemplateBranch(
	branch: BranchName,
	targetPath: string,
): Promise<void> {
	const templateDir = branchToTemplateMap[branch];
	if (!templateDir) {
		throw new Error(`Unknown template branch: ${branch}`);
	}

	// Get the package root directory
	const packageRoot = findPackageRoot(__dirname);
	
	// Get the source template path
	const sourcePath = path.join(packageRoot, "templates", templateDir);

	// Ensure the source template exists
	if (!await fs.pathExists(sourcePath)) {
		throw new Error(`Template not found: ${templateDir}`);
	}

	// Copy the template to the target path
	await fs.copy(sourcePath, targetPath, {
		overwrite: true,
		errorOnExist: false,
	});
}

export async function initializeGit(projectPath: string): Promise<void> {
	// Dynamic import simple-git only when needed for git init
	const simpleGit = (await import("simple-git")).default;
	const git = simpleGit(projectPath);
	await git.init();
	await git.add(".");
	await git.commit("Initial commit from create-vinoflare");
}
