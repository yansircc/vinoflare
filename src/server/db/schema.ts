import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { index } from "drizzle-orm/sqlite-core";

// Better Auth 需要的表
export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

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
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }),
	updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// JWT 插件需要的表
export const jwks = sqliteTable("jwks", {
	id: text("id").primaryKey(),
	publicKey: text("publicKey").notNull(),
	privateKey: text("privateKey").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// 现有的业务表
export const todos = sqliteTable(
	"todos",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		title: text("title").notNull(),
		description: text("description"),
		completed: integer("completed", { mode: "boolean" })
			.notNull()
			.default(false),
		priority: text("priority", { enum: ["low", "medium", "high"] })
			.notNull()
			.default("medium"),
		createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
		updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
	},
	(table) => [
		// 添加索引以优化查询性能
		index("todos_completed_idx").on(table.completed),
		index("todos_priority_idx").on(table.priority),
		index("todos_created_at_idx").on(table.createdAt),
		// 复合索引，用于状态和优先级的联合查询
		index("todos_completed_priority_idx").on(table.completed, table.priority),
	],
);
