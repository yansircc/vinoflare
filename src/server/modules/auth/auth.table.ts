import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Authentication-related tables required by Better Auth
 * Self-contained within the auth module
 */

// User table
export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("createdAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull()
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// Session table
export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	token: text("token").notNull().unique(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull()
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// Account table for OAuth providers
export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
		mode: "timestamp",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("createdAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull()
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// Verification table for email verification, password reset, etc.
export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).default(
		sql`(CURRENT_TIMESTAMP)`,
	),
	updatedAt: integer("updatedAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// JWKS table for JWT plugin
export const jwks = sqliteTable("jwks", {
	id: text("id").primaryKey(),
	publicKey: text("publicKey").notNull(),
	privateKey: text("privateKey").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});
