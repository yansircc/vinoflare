import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { session, user } from "../../db/tables/auth";

/**
 * User validation schemas
 */
const userIdSchema = z
	.uuid()
	.meta({ example: "123e4567-e89b-12d3-a456-426614174000" })
	.describe("User ID");

const userNameSchema = z
	.string()
	.min(1, "Name is required")
	.max(100, "Name must be 100 characters or less")
	.meta({ example: "John Doe" })
	.describe("Name of the user");

const userEmailSchema = z
	.email()
	.meta({ example: "john@example.com" })
	.describe("Email of the user");

const userEmailVerifiedSchema = z
	.boolean()
	.meta({ example: true })
	.describe("Email verified status of the user");

const userImageSchema = z
	.string()
	.nullable()
	.optional()
	.meta({ example: "https://example.com/image.png" })
	.describe("Image of the user");

const userCreatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("User creation timestamp");

const userUpdatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("User update timestamp");

// User schemas
export const selectUserSchema = createSelectSchema(user, {
	id: userIdSchema,
	name: userNameSchema,
	email: userEmailSchema,
	emailVerified: userEmailVerifiedSchema,
	image: userImageSchema.optional(),
	createdAt: userCreatedAtSchema,
	updatedAt: userUpdatedAtSchema,
});

export const insertUserSchema = createInsertSchema(user, {
	name: userNameSchema,
	email: userEmailSchema,
	emailVerified: userEmailVerifiedSchema,
	image: userImageSchema,
});

/**
 * Session validation schemas
 */
const sessionIdSchema = z.uuid();
const sessionUserIdSchema = z.uuid();
const sessionTokenSchema = z
	.string()
	.min(1, "Token is required")
	.describe("Session token");
const sessionIpAddressSchema = z
	.string()
	.nullable()
	.optional()
	.describe("Client IP address");
const sessionUserAgentSchema = z
	.string()
	.nullable()
	.optional()
	.describe("Client user agent");
const sessionExpiresAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Session expiration timestamp");
const sessionCreatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Session creation timestamp");
const sessionUpdatedAtSchema = z.iso
	.datetime({ offset: true })
	.meta({ example: "2024-01-01T00:00:00.000Z" })
	.describe("Session update timestamp");

// Session schemas
export const selectSessionSchema = createSelectSchema(session, {
	id: sessionIdSchema,
	expiresAt: sessionExpiresAtSchema,
	createdAt: sessionCreatedAtSchema,
	updatedAt: sessionUpdatedAtSchema,
	token: sessionTokenSchema,
	ipAddress: sessionIpAddressSchema.optional(),
	userAgent: sessionUserAgentSchema.optional(),
	userId: sessionUserIdSchema,
});

// Export individual field schemas for reuse
export {
	userNameSchema,
	userEmailSchema,
	userEmailVerifiedSchema,
	userImageSchema,
	sessionTokenSchema,
	sessionIpAddressSchema,
	sessionUserAgentSchema,
};
