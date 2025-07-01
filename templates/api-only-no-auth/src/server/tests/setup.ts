import { env } from "cloudflare:test";
import { beforeAll } from "vitest";

// Apply database migrations before all tests
beforeAll(async () => {
	try {
		// Apply migrations manually since readD1Migrations is not available in test environment
		const migrations = [
			{
				name: "0000_initial.sql",
				queries: [
					`CREATE TABLE todo (
						id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
						title text NOT NULL,
						completed integer DEFAULT false NOT NULL,
						created_at integer DEFAULT (unixepoch()) NOT NULL,
						updated_at integer DEFAULT (unixepoch()) NOT NULL
					)`,
				],
			},
		];

		// Apply migrations to the test database
		// Execute each migration query
		for (const migration of migrations) {
			for (const query of migration.queries) {
				await env.DB.prepare(query).run();
			}
		}

		console.log("✅ Database migrations applied successfully");
	} catch (error) {
		console.error("❌ Failed to apply database migrations:", error);
		throw error;
	}
});
