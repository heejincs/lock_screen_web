import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite picks its own port (default 5173) — no hardcoded port per project policy.
// The dev server proxies /api → wiki so the SPA can use same-origin cookies.
// Override the upstream with VITE_WIKI_ORIGIN (default localhost wiki port).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_WIKI_ORIGIN ?? 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
