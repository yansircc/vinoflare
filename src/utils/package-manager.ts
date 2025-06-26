import type { PackageManager } from "../types";

/**
 * Detect the package manager being used
 */
export function detectPackageManager(): PackageManager {
	const userAgent = process.env.npm_config_user_agent || "";

	if (userAgent.includes("bun")) return "bun";
	if (userAgent.includes("yarn")) return "yarn";
	if (userAgent.includes("pnpm")) return "pnpm";
	return "npm";
}

/**
 * Validate if a package manager is supported
 */
export function isValidPackageManager(pm: string): pm is PackageManager {
	return ["npm", "yarn", "pnpm", "bun"].includes(pm);
}

/**
 * Get install command for package manager
 */
export function getInstallCommand(pm: PackageManager): string {
	return pm === "npm" ? "npm install" : `${pm} install`;
}

/**
 * Get run command for package manager
 */
export function getRunCommand(pm: PackageManager, script: string): string {
	return pm === "npm" ? `npm run ${script}` : `${pm} run ${script}`;
}

/**
 * Get add dependency command
 */
export function getAddCommand(
	pm: PackageManager,
	dep: string,
	dev = false,
): string {
	const devFlag = dev ? "-D" : "";

	switch (pm) {
		case "npm":
			return `npm install ${devFlag} ${dep}`;
		case "yarn":
			return `yarn add ${devFlag} ${dep}`;
		case "pnpm":
			return `pnpm add ${devFlag} ${dep}`;
		case "bun":
			return `bun add ${devFlag} ${dep}`;
	}
}

/**
 * Get remove dependency command
 */
export function getRemoveCommand(pm: PackageManager, dep: string): string {
	switch (pm) {
		case "npm":
			return `npm uninstall ${dep}`;
		case "yarn":
			return `yarn remove ${dep}`;
		case "pnpm":
			return `pnpm remove ${dep}`;
		case "bun":
			return `bun remove ${dep}`;
	}
}
