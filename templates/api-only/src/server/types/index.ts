/**
 * Central type exports for the server
 *
 * This file exports all TypeScript types used across the server,
 * including database types, API types, and other domain types.
 */

import type { z } from "zod/v4";
import type * as schemas from "../schemas/database";

// Post
export type SelectPost = z.infer<typeof schemas.selectPostSchema>;
export type InsertPost = z.infer<typeof schemas.insertPostSchema>;
export type UpdatePost = z.infer<typeof schemas.updatePostSchema>;

// User
export type SelectUser = z.infer<typeof schemas.selectUserSchema>;
export type InsertUser = z.infer<typeof schemas.insertUserSchema>;

// Session
export type SelectSession = z.infer<typeof schemas.selectSessionSchema>;

// Better Auth returns these with optional fields
export type AuthUser = Omit<SelectUser, "createdAt" | "updatedAt"> & {
	createdAt: Date;
	updatedAt: Date;
};
export type AuthSession = Omit<
	SelectSession,
	"createdAt" | "updatedAt" | "expiresAt"
> & {
	createdAt: Date;
	updatedAt: Date;
	expiresAt: Date;
};
