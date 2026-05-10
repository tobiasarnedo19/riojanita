import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'minilogo.png'],
      manifest: {
        name: 'Riojanita - Liquidación',
        short_name: 'Riojanita',
        description: 'Sistema de Gestión de Liquidaciones - Riojanita',
        theme_color: '#DD3300',
        background_color: '#F4F4F4',
        display: 'standalone',
        icons: [
          {
            src: 'minilogo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'minilogo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'minilogo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
