import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { z } from "zod/v4";
import { user, session, account, verification, jwks } from "./auth.table";
import {
	selectUserSchema,
	updateUserSchema,
	selectSessionSchema,
	selectAccountSchema,
	selectVerificationSchema,
	selectJwksSchema,
} from "./auth.schema";

/**
 * User types
 */
export type User = InferSelectModel<typeof user>;
export type InsertUser = InferInsertModel<typeof user>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;

/**
 * Session types
 */
export type Session = InferSelectModel<typeof session>;
export type InsertSession = InferInsertModel<typeof session>;
export type SelectSession = z.infer<typeof selectSessionSchema>;

/**
 * Account types
 */
export type Account = InferSelectModel<typeof account>;
export type InsertAccount = InferInsertModel<typeof account>;
export type SelectAccount = z.infer<typeof selectAccountSchema>;

/**
 * Verification types
 */
export type Verification = InferSelectModel<typeof verification>;
export type InsertVerification = InferInsertModel<typeof verification>;
export type SelectVerification = z.infer<typeof selectVerificationSchema>;

/**
 * JWKS types
 */
export type Jwks = InferSelectModel<typeof jwks>;
export type InsertJwks = InferInsertModel<typeof jwks>;
export type SelectJwks = z.infer<typeof selectJwksSchema>;

/**
 * Auth context types
 */
export interface AuthContext {
	user: User | null;
	session: Session | null;
}

/**
 * API response types
 */
export interface UserResponse {
	user: SelectUser;
}

export interface SessionResponse {
	session: SelectSession;
	user: SelectUser;
}

export interface AuthResponse {
	user: SelectUser;
	session: SelectSession;
	token: string;
}

export interface MessageResponse {
	message: string;
}

/**
 * Better Auth compatibility types
 */
export interface BetterAuthUser {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface BetterAuthSession {
	id: string;
	userId: string;
	token: string;
	expiresAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
	createdAt: Date;
	updatedAt: Date;
}