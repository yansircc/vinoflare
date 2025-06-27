/**
 * Export all database tables
 *
 * This is the main entry point for table definitions.
 * Import tables from here to ensure consistency.
 */

// Authentication tables
export * from "./auth";

// Application tables
// Note: posts table is now self-contained in the posts module
// export * from "./posts"; // Moved to @/server/modules/posts
