import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"
import * as types from "./types"

export function createDb(env: Env) {
  return drizzle(env.DB);
}

export { types, schema }