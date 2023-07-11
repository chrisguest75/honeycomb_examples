/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 30000,
  },
  logLevel: 'info',
  esbuild: {
    sourcemap: 'both',
  },
  resolve: {
    alias: {
      '@16-sst-lambda/core': './services/core',
    },
  },
})
