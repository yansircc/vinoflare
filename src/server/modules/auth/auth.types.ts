import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod/v4";
import type {
	selectSessionSchema,
	selectUserSchema,
	updateUserSchema,
} from "./auth.schema";
import type { session, user } from "./auth.table";

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
