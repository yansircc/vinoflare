#!/usr/bin/env node

// Entry point that delegates to either legacy or modular implementation
async function run() {
	if (process.argv.includes("--modular")) {
		const { main } = await import("./index-modular.js");
		await main();
	} else {
		const { main } = await import("./index-legacy.js");
		await main();
	}
}

run().catch((error) => {
	console.error("Failed to start CLI:", error);
	process.exit(1);
});