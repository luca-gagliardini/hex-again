import { defineConfig } from 'vite'

export default defineConfig({
  base: '/hex_game_again/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
})
