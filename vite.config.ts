/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // 'prompt': a nova versão só é ativada quando o jogo está na tela inicial,
      // nunca no meio de uma partida (ver src/services/pwa.ts).
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['assets/*.svg', 'assets/*.png'],
      manifest: {
        name: 'Desafio Tech Donaduzzi',
        short_name: 'Desafio Tech',
        description: 'Quiz gamificado da Faculdade Donaduzzi para totem touchscreen.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'portrait',
        background_color: '#541822',
        theme_color: '#541822',
        icons: [
          { src: 'assets/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,ico,json}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
