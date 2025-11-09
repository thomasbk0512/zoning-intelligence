import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    copyPublicDir: true, // Copy public/ directory (includes build_info.json)
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  publicDir: 'public',
  // Copy golden fixtures to dist for stub mode
  assetsInclude: ['**/*.json'],
})
