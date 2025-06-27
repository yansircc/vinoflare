import type { CommandFlags, ParsedArgs } from "../types";

/**
 * Parse command line arguments
 */
export function parseArgs(argv: string[] = process.argv): ParsedArgs {
	const args = argv.slice(2);
	const projectName = args.find(
		(arg) => !arg.startsWith("--") && !arg.startsWith("-"),
	);

	// Parse flags
	const flags: CommandFlags = {
		noInstall: args.includes("--no-install"),
		noGit: args.includes("--no-git"),
		yes: args.includes("-y") || args.includes("--yes"),
		projectType: getArgValue(args, "--type") as
			| "full-stack"
			| "api-only"
			| undefined,
		noDb: args.includes("--no-db"),
		noAuth: args.includes("--no-auth"),
		skipInit: args.includes("--skip-init"),
		packageManager: getArgValue(args, "--pm"),
		help: args.includes("--help") || args.includes("-h"),
	};

	return { projectName, flags };
}

/**
 * Get value for a flag like --type=value
 */
function getArgValue(args: string[], flag: string): string | undefined {
	const arg = args.find((a) => a.startsWith(`${flag}=`));
	return arg?.split("=")[1];
}

/**
 * Validate parsed arguments
 */
export function validateArgs(args: ParsedArgs): string[] {
	const errors: string[] = [];

	if (args.flags.yes && !args.projectName) {
		errors.push("Project name is required when using -y/--yes flag");
	}

	if (
		args.flags.projectType &&
		!["full-stack", "api-only"].includes(args.flags.projectType)
	) {
		errors.push('Invalid project type. Use "full-stack" or "api-only"');
	}

	if (
		args.projectName &&
		args.projectName !== "." &&
		!/^[a-z0-9-_]+$/.test(args.projectName)
	) {
		errors.push(
			"Project name can only contain lowercase letters, numbers, hyphens and underscores",
		);
	}

	return errors;
}
