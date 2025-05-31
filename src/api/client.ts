import type { ApiType } from "@/server/api";
import { hc } from "hono/client";

export const client = hc<ApiType>("/").api;
