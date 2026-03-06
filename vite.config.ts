import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Bartender's Choice",
        short_name: "Bartender's",
        description: '755 cocktail recipes with guided recommendations',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/images/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/logo.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json}'],
        runtimeCaching: [
          {
            urlPattern: /\/images\/cocktails\/.+\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cocktail-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/images\/thumbs\/.+\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'thumb-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/images\/guides\/.+\.png$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'guide-images',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})
