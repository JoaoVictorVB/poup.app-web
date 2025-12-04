import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/e2e/*.e2e-spec.ts', 'src/**/*.e2e-spec.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    // Run tests sequentially to avoid connection overload
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Isolate tests to prevent shared state issues
    isolate: true,
    // Limit concurrent tests
    maxConcurrency: 1,
    // Retry failed tests once (for flaky connection issues)
    retry: 1,
  },
})
