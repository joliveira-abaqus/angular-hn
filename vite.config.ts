/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            // O manifesto é mantido à mão em public/manifest.webmanifest.
            manifest: false,
            workbox: {
                // App shell: tudo que o build gera + assets estáticos é pré-cacheado.
                globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,webmanifest}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.origin === 'https://node-hnapi.herokuapp.com',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hnapi',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    server: { port: 4200 },
    preview: { port: 4200 },
    css: {
        preprocessorOptions: {
            scss: {
                // Os .scss herdados do app Angular ainda usam @import, divisão com "/" e darken().
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
