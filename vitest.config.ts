import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@circuitlab/shared': path.resolve(__dirname, './shared/index.ts'),
      '@': path.resolve(__dirname, './'),
    },
  },
});
