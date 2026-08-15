import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  server: {
    port: 3001,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
