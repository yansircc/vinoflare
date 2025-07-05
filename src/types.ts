export interface CLIOptions {
	name: string;
	type?: "full-stack" | "api-only";
	auth?: boolean;
	db?: boolean;
	yes?: boolean;
	install?: boolean;
	git?: boolean;
	packageManager?: string;
	setup?: boolean;
	rpc?: boolean;
}

export interface ProjectConfig {
	name: string;
	type: "full-stack" | "api-only";
	auth: boolean;
	db: boolean;
	git: boolean;
	install: boolean;
	packageManager: PackageManager;
	yes?: boolean;
	setup: boolean;
	rpc: boolean;
}

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export type BranchName =
	| "orval"
	| "orval-no-auth"
	| "orval-no-db"
	| "api"
	| "api-no-auth"
	| "api-no-db"
	| "rpc"
	| "rpc-no-auth"
	| "rpc-no-db";

export interface BranchMapping {
	type: "full-stack" | "api-only";
	auth: boolean;
	db: boolean;
	branch: BranchName;
	rpc?: boolean;
}
