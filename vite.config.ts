import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: []
  },
  plugins: [react()],
  server: {
    port: 3020,
  },
  preview: {
    port: 3020,
  }
})
