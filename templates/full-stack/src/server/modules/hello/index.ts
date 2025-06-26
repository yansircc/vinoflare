import type { ModuleDefinition } from "../../core/module-loader";
import { createHelloModule } from "./hello.routes";

const helloModule: ModuleDefinition = {
	name: "hello",
	basePath: "/hello",
	createModule: createHelloModule,
	metadata: {
		version: "1.0.0",
		tags: ["Hello"],
		security: ["public"],
	},
};

export default helloModule;
