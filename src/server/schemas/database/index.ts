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

// Post schemas
export {
	insertPostSchema,
	postCreatedAtSchema,
	// Field schemas
	postIdSchema,
	postTitleSchema,
	postUpdatedAtSchema,
	selectPostSchema,
	updatePostSchema,
} from "./posts";

// Book schemas
export {
	insertBooksSchema,
	selectBooksSchema,
	updateBooksSchema,
	// Field schemas
	bookIdSchema,
	bookTitleSchema,
	bookAuthorSchema,
	bookIsbnSchema,
	bookPublishedYearSchema,
	bookGenreSchema,
	bookDescriptionSchema,
	bookPageCountSchema,
	bookLanguageSchema,
	bookPublisherSchema,
	bookCoverImageUrlSchema,
	bookPriceSchema,
	bookStockSchema,
	bookIsAvailableSchema,
	bookCreatedAtSchema,
	bookUpdatedAtSchema,
} from "./books";
