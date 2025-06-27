import type { ModuleDefinition } from "../../core/module-loader";
import { createBooksModule } from "./books.routes";

const booksModule: ModuleDefinition = {
	name: "books",
	basePath: "/books",
	createModule: createBooksModule,
	metadata: {
		version: "1.0.0",
		tags: ["Books"],
	},
};

export default booksModule;