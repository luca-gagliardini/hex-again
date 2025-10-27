import { defineConfig } from 'vite'

export default defineConfig({
  base: '/hex-again/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
})
