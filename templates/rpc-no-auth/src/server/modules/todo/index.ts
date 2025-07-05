import type { ModuleDefinition } from "../../core/module-loader";
import { createTodoModule } from "./todo.routes";
import { todo } from "./todo.table";

// Export public APIs
export * from "./todo.schema";
export { todo } from "./todo.table";

// Module definition
const todoModule: ModuleDefinition = {
	name: "todo",
	basePath: "/todo",
	createModule: createTodoModule,
	metadata: {
		version: "1.0.0",
		tags: ["Todo"],
	},
	tables: {
		todo,
	},
};

export default todoModule;
