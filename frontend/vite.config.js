import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 1. MOBILE REQUIREMENT: Set base to './' so assets load relative to the app file
  base: './', 
  build: {
    // 2. MOBILE REQUIREMENT: Output to 'dist'
    outDir: 'dist',
  },
  // 3. WEB REQUIREMENT: Keep this so your laptop dev environment still works!
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})