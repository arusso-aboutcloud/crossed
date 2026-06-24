import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
