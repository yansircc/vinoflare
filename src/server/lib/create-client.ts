import type { AppType } from "@/index";
import { hc } from "hono/client";

export const client = hc<AppType>("/");
