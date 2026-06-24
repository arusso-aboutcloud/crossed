import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

const isTest = !!process.env.VITEST;

export default defineConfig({
  plugins: isTest ? [] : [svelte()],
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib')
    }
  },
  build: {
    /*
     * Multi-page build: main app + harness.
     * To exclude the harness from production, remove the harness entry below.
     * The harness page is not linked from the main app shell so it is
     * unreachable to end-users even if the file is present in dist/.
     */
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        harness: resolve(__dirname, 'src/dev/harness.html'),
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
    },
  },
});
