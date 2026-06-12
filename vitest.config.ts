import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['sample/**/*'],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
