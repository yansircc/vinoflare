import path from "node:path";
import simpleGit from "simple-git";
import type { BranchName } from "./types";

const TEMPLATE_REPO = "https://github.com/yansircc/vinoflare-templates.git";

export async function cloneTemplateBranch(
	branch: BranchName,
	targetPath: string,
): Promise<void> {
	const git = simpleGit();

	// Clone specific branch with depth 1 for faster cloning
	await git.clone(TEMPLATE_REPO, targetPath, [
		"--branch",
		branch,
		"--depth",
		"1",
		"--single-branch",
	]);

	// Remove the .git directory to start fresh
	const fs = await import("fs-extra");
	await fs.remove(path.join(targetPath, ".git"));
}

export async function initializeGit(projectPath: string): Promise<void> {
	const git = simpleGit(projectPath);
	await git.init();
	await git.add(".");
	await git.commit("Initial commit from create-vinoflare");
}
