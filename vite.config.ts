import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '행촉남 Compass',
        short_name: 'Compass',
        description: '성찰을 행동으로, 행동을 행복으로.',
        theme_color: '#5b4636',
        background_color: '#faf7f2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
