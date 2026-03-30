import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'computation-bags-stripes-compaq.trycloudflare.com'
    ]
  }
})