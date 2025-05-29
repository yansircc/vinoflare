import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"
import * as types from "./types"

// 统一的数据库创建函数 - 总是包含 schema
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;

export { types, schema }