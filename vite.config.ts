import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Fix: SockJS uses Node.js `global` which doesn't exist in browser context
  define: {
    global: 'globalThis',
  },
  build: {
    // xlsx + stomp deps are large — suppress warning to avoid CI exit code 1
    chunkSizeWarningLimit: 900,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
