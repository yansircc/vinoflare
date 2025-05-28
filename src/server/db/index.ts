import { drizzle } from "drizzle-orm/d1"
import { quotes } from "./schema"

export interface Env {
  DB: D1Database;
}

export function createDb(env: Env) {
  return drizzle(env.DB);
}

export { quotes };
