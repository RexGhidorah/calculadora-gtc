import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Esto permite cualquier host en el servidor de desarrollo
    allowedHosts: true 
  }
})
