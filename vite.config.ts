/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            filename: 'sw.js',
            includeAssets: ['favicon.ico', 'manifest.json', 'assets/**/*'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json,xml}'],
                navigateFallback: '/index.html',
            },
        }),
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        css: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/test/**', 'src/vite-env.d.ts', 'src/main.tsx'],
        },
        exclude: ['e2e/**', 'node_modules/**'],
    },
});
