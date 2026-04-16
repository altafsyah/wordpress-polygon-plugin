import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'build',
    manifest: true,
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/wp-json': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
