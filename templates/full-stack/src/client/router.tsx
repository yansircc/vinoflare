import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "@/generated/routeTree.gen";

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "intent",
	});

	return router;
}
