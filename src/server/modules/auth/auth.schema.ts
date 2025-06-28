import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { user, session, account, verification, jwks } from "./auth.table";

/**
 * User schemas
 */
export const insertUserSchema = createInsertSchema(user, {
	email: z.string().email("Invalid email address"),
	emailVerified: z.boolean().default(false),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const selectUserSchema = createSelectSchema(user);

export const updateUserSchema = insertUserSchema.partial().omit({
	id: true,
	createdAt: true,
});

/**
 * Session schemas
 */
export const insertSessionSchema = createInsertSchema(session, {
	expiresAt: z.date(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const selectSessionSchema = createSelectSchema(session);

/**
 * Account schemas
 */
export const insertAccountSchema = createInsertSchema(account, {
	accessTokenExpiresAt: z.date().nullable().optional(),
	refreshTokenExpiresAt: z.date().nullable().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const selectAccountSchema = createSelectSchema(account);

/**
 * Verification schemas
 */
export const insertVerificationSchema = createInsertSchema(verification, {
	expiresAt: z.date(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const selectVerificationSchema = createSelectSchema(verification);

/**
 * JWKS schemas
 */
export const insertJwksSchema = createInsertSchema(jwks, {
	createdAt: z.date().optional(),
});

export const selectJwksSchema = createSelectSchema(jwks);

/**
 * Auth-specific validation schemas
 */
export const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const signUpSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
});

export const resetPasswordSchema = z.object({
	email: z.string().email(),
});

export const verifyEmailSchema = z.object({
	token: z.string(),
});