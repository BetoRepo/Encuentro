import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  base: './', // Use relative paths so deployed index references local assets
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // Enable PWA plugin only in development to avoid service worker caching old builds on Vercel
    ...(import.meta.env.DEV
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
              enabled: true,
            },
            strategies: 'generateSW',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
              name: 'Encuentro Nacional de Jóvenes',
              short_name: 'ENJ 2026',
              description: 'Plataforma oficial del Encuentro Nacional de Jóvenes - Scouts de Venezuela',
              theme_color: '#000B6F',
              background_color: '#F0F2FA',
              display: 'standalone',
              scope: '/',
              start_url: '/',
              icons: [
                { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
              ],
            },
            workbox: { runtimeCaching: [] },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
