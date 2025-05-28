import { drizzle } from "drizzle-orm/d1"
import { quotes } from "./schema"

export function createDb(env: Env) {
  return drizzle(env.DB);
}

export { quotes };
