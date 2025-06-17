import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { renderer } from "../../renderer";
import { DelayPresets, delayMiddleware } from "../middleware";
import type { AppOpenAPI, BaseContext } from "./types";

export function createRouter() {
	return new OpenAPIHono<BaseContext>({
		strict: false,
		defaultHook,
	});
}

export default function createApp() {
	const app = createRouter();
	app.use(renderer);
	app.use(logger());
	app.use("*", cors());
	app.use(serveEmojiFavicon("📝"));
	app.notFound(notFound);
	app.onError(onError);
	app.use(trimTrailingSlash());
	// app.use(delayMiddleware(DelayPresets.slow));
	return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
	return createApp().route("/", router);
}
