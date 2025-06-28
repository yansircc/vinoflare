import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

const {
	LOCAL_DB_PATH,
	CLOUDFLARE_DATABASE_ID,
	CLOUDFLARE_D1_TOKEN,
	CLOUDFLARE_ACCOUNT_ID,
} = process.env;

// Use better-sqlite driver for local development
export default LOCAL_DB_PATH
	? ({
			schema: ["./src/server/db/tables/*", "./src/server/modules/*/*.table.ts"],
			dialect: "sqlite",
			dbCredentials: {
				url: LOCAL_DB_PATH,
			},
		} satisfies Config)
	: defineConfig({
			out: "./src/server/db/migrations",
			schema: ["./src/server/db/tables/*", "./src/server/modules/*/*.table.ts"],
			dialect: "sqlite",
			driver: "d1-http",
			dbCredentials: {
				accountId: CLOUDFLARE_ACCOUNT_ID!,
				databaseId: CLOUDFLARE_DATABASE_ID!,
				token: CLOUDFLARE_D1_TOKEN!,
			},
		});
