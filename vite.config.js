import { defineConfig } from 'vite'

// Determine base path based on environment
const getBasePath = () => {
  // If building a PR preview
  if (process.env.VITE_PR_PREVIEW === 'true' && process.env.VITE_PR_NUMBER) {
    return `/hex-again/pr-preview/pr-${process.env.VITE_PR_NUMBER}/`
  }
  // Production build
  return '/hex-again/'
}

export default defineConfig({
  base: getBasePath(),
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
})
