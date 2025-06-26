import { routeTree } from "@/generated/routeTree.gen";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "intent",
	});

	return router;
}
