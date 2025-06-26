import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  shims: true,
  dts: false,
  external: ['fs-extra', '@clack/prompts', 'kleur'],
});