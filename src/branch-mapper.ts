import type { BranchMapping, BranchName, ProjectConfig } from "./types";

const branchMappings: BranchMapping[] = [
	{ type: "full-stack", auth: true, db: true, branch: "main" },
	{ type: "full-stack", auth: false, db: true, branch: "full-stack-no-auth" },
	{
		type: "full-stack",
		auth: false,
		db: false,
		branch: "full-stack-no-auth-no-db",
	},
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
			m.type === config.type && m.auth === effectiveAuth && m.db === config.db,
	);

	if (!mapping) {
		throw new Error(
			`No branch mapping found for config: ${JSON.stringify(config)}`,
		);
	}

	return mapping.branch;
}
