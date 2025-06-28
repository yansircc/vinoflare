import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { z } from "zod/v4";
import { user, session } from "./auth.table";
import {
	selectUserSchema,
	updateUserSchema,
	selectSessionSchema,
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
