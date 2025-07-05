import type { BranchMapping, BranchName, ProjectConfig } from "./types";

const branchMappings: BranchMapping[] = [
	// Orval (OpenAPI) based templates
	{ type: "full-stack", auth: true, db: true, branch: "main", rpc: false },
	{
		type: "full-stack",
		auth: false,
		db: true,
		branch: "full-stack-no-auth",
		rpc: false,
	},
	{
		type: "full-stack",
		auth: false,
		db: false,
		branch: "full-stack-no-auth-no-db",
		rpc: false,
	},
	// Hono RPC based templates
	{
		type: "full-stack",
		auth: true,
		db: true,
		branch: "full-stack-rpc",
		rpc: true,
	},
	{
		type: "full-stack",
		auth: false,
		db: true,
		branch: "full-stack-rpc-no-auth",
		rpc: true,
	},
	{
		type: "full-stack",
		auth: false,
		db: false,
		branch: "full-stack-rpc-no-db",
		rpc: true,
	},
	// API only templates (no RPC option)
	{ type: "api-only", auth: true, db: true, branch: "api-only" },
	{ type: "api-only", auth: false, db: true, branch: "api-only-no-auth" },
	{
		type: "api-only",
		auth: false,
		db: false,
		branch: "api-only-no-auth-no-db",
	},
];

export function getBranchForConfig(config: ProjectConfig): BranchName {
	// Auth requires DB, so if no DB, force no auth
	const effectiveAuth = config.db ? config.auth : false;

	const mapping = branchMappings.find(
		(m) =>
			m.type === config.type &&
			m.auth === effectiveAuth &&
			m.db === config.db &&
			// Only check RPC for full-stack projects
			(config.type === "full-stack" ? m.rpc === config.rpc : true),
	);

	if (!mapping) {
		throw new Error(
			`No branch mapping found for config: ${JSON.stringify(config)}`,
		);
	}

	return mapping.branch;
}
