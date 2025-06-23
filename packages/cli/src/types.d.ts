declare module "degit" {
	interface DegitOptions {
		cache?: boolean;
		force?: boolean;
		verbose?: boolean;
	}

	interface Emitter {
		clone(dest: string): Promise<void>;
	}

	function degit(repo: string, options?: DegitOptions): Emitter;

	export = degit;
}
