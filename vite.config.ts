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
            // O manifest é servido como arquivo estático em public/manifest.webmanifest.
            manifest: false,
            workbox: {
                // Equivalente ao assetGroup "app" (installMode: prefetch) do ngsw-config.json.
                globPatterns: ['index.html', 'favicon.ico', 'manifest.webmanifest', 'static/**/*.{js,css}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        // Equivalente ao assetGroup "assets" (installMode: lazy, updateMode: prefetch).
                        urlPattern: ({ sameOrigin, url }) =>
                            sameOrigin &&
                            (url.pathname.startsWith('/assets/') ||
                                /\.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/.test(url.pathname)),
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'assets' },
                    },
                    {
                        // Cache da API node-hnapi: rede primeiro, com fallback offline para o último conteúdo visto.
                        // Regex literal: funções do urlPattern são serializadas no sw.js e não enxergam variáveis do módulo.
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\//,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hnapi',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        // Mantém /assets/ reservado aos arquivos estáticos originais (ícones e imagens).
        assetsDir: 'static',
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    server: {
        port: 4200,
    },
    preview: {
        port: 4200,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
