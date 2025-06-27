/**
 * Export all validation schemas
 *
 * This is the main entry point for validation schemas.
 * Import schemas from here to ensure consistency.
 */

// Authentication schemas
export {
	insertUserSchema,
	selectSessionSchema,
	selectUserSchema,
	sessionIpAddressSchema,
	sessionTokenSchema,
	sessionUserAgentSchema,
	userEmailSchema,
	userEmailVerifiedSchema,
	userImageSchema,
	// Field schemas
	userNameSchema,
} from "./auth";
