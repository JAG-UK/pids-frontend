import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@styles": path.resolve(__dirname, "./src/styles"),
    },
  },
  define: {
    // Inject build timestamp at build time (not runtime)
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
