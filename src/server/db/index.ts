import { drizzle } from "drizzle-orm/d1"
import { quotes } from "./schema"

export function createDb(env: CloudflareBindings) {
  return drizzle(env.DB);
}

export { quotes };
