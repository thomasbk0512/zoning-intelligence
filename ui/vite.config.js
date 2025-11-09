import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isPreview = mode === 'development' || process.env.VITE_PREVIEW_BUILD === 'true'
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: false, // Don't auto-open, use preview:open script instead
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      copyPublicDir: true, // Copy public/ directory (includes build_info.json)
    },
    define: {
      // Expose build info in preview mode
      __BUILD_INFO__: isPreview ? JSON.stringify({
        mode,
        timestamp: new Date().toISOString(),
        preview: true,
        answersEnabled: process.env.VITE_ANSWERS_ENABLE === 'true',
        answersStub: process.env.VITE_ANSWERS_STUB === '1',
      }) : undefined,
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: []
    },
    publicDir: 'public',
    // Copy golden fixtures to dist for stub mode
    assetsInclude: ['**/*.json'],
  }
})
