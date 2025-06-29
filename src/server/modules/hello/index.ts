import type { ModuleDefinition } from "../../core/module-loader";
import { createHelloRoutes } from "./hello.routes";

const helloModule: ModuleDefinition = {
	name: "hello",
	basePath: "/hello",
	createModule: createHelloRoutes,
};

export default helloModule;
