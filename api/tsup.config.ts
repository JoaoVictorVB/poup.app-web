import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  outDir: 'build',
  format: ['cjs', 'esm'],
  target: 'es2020',
  skipNodeModulesBundle: true,
  external: ['@vitest/*', 'vitest'],
  ignore: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.test.ts'],
})
