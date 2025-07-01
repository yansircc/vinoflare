import { env } from "cloudflare:test";
import { beforeAll } from "vitest";

// Apply database migrations before all tests
beforeAll(async () => {
	try {
		// Apply migrations manually since readD1Migrations is not available in test environment
		const migrations = [
			{
				name: "0000_breezy_mauler.sql",
				queries: [
					`CREATE TABLE account (
						id text PRIMARY KEY NOT NULL,
						accountId text NOT NULL,
						providerId text NOT NULL,
						userId text NOT NULL,
						accessToken text,
						refreshToken text,
						idToken text,
						accessTokenExpiresAt integer,
						refreshTokenExpiresAt integer,
						scope text,
						password text,
						createdAt integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
						updatedAt integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
						FOREIGN KEY (userId) REFERENCES user(id) ON UPDATE no action ON DELETE no action
					)`,
					`CREATE TABLE jwks (
						id text PRIMARY KEY NOT NULL,
						publicKey text NOT NULL,
						privateKey text NOT NULL,
						createdAt integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
					)`,
					`CREATE TABLE session (
						id text PRIMARY KEY NOT NULL,
						userId text NOT NULL,
						token text NOT NULL,
						ipAddress text,
						userAgent text,
						expiresAt integer NOT NULL,
						createdAt integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
						updatedAt integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
						FOREIGN KEY (userId) REFERENCES user(id) ON UPDATE no action ON DELETE no action
					)`,
					`CREATE UNIQUE INDEX session_token_unique ON session (token)`,
					`CREATE TABLE user (
						id text PRIMARY KEY NOT NULL,
						name text NOT NULL,
						email text NOT NULL,
						emailVerified integer NOT NULL,
						image text,
						createdAt integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
						updatedAt integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
					)`,
					`CREATE UNIQUE INDEX user_email_unique ON user (email)`,
					`CREATE TABLE verification (
						id text PRIMARY KEY NOT NULL,
						identifier text NOT NULL,
						value text NOT NULL,
						expiresAt integer NOT NULL,
						createdAt integer DEFAULT (CURRENT_TIMESTAMP),
						updatedAt integer DEFAULT (CURRENT_TIMESTAMP)
					)`,
					`CREATE TABLE todo (
						id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
						title text NOT NULL,
						completed integer DEFAULT false NOT NULL,
						user_id text NOT NULL,
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
