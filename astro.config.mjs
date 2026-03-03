import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: cloudflare({
        imageService: 'passthrough',
    }),
    integrations: [react()],
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: import.meta.env.PROD && {
                'react-dom/server': 'react-dom/server.edge',
            },
        },
    },
});
