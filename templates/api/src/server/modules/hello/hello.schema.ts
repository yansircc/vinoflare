import { z } from "zod/v4";

export const helloResponseSchema = z.object({
	message: z.string().describe("Greeting message"),
	time: z.iso.datetime().describe("Current timestamp"),
});

export type HelloResponse = z.infer<typeof helloResponseSchema>;
