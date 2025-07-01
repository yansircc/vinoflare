// Re-export modular database functions and types
export { createModularDb, ModuleRegistry } from "./modular";

// Type export for the database instance
export type Database = ReturnType<typeof import("./modular").createModularDb>;
