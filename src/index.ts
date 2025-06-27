#!/usr/bin/env node

import { main } from "./main.js";

main().catch((error) => {
	console.error("Failed to start CLI:", error);
	process.exit(1);
});
